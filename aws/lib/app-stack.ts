import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { InfraProps } from "../props/infra-props";
import { StorageProps } from "../props/storage-props";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { Port } from "aws-cdk-lib/aws-ec2";
import { DnsRecordType } from "aws-cdk-lib/aws-servicediscovery";
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class AppStack extends Stack {

    feService: ecs.Ec2Service;
    beService: ecs.Ec2Service;

    constructor(scope: Construct, id: string, props: StackProps & InfraProps & StorageProps) {
        super(scope, id, props);

        const taskExecutionRole = new iam.Role(this, 'TaskExecutionRole', {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
            ]
        });

        //log groups
        const appLogGroup = new LogGroup(this, 'App_Logs', {
            removalPolicy: RemovalPolicy.DESTROY,
            logGroupName: 'app-logs'
        });

        const jwtSecretParam = ssm.StringParameter.fromSecureStringParameterAttributes(
            this,
            "Jwt_Secret",{
                parameterName: '/my-app/jwt-secret'
            }
        );

        const DbPassParam = ssm.StringParameter.fromSecureStringParameterAttributes(
            this,
            "Db_Pass",{
                parameterName: "/my-app/db-password"
            }
        );


        // define task definintions
        const feTd = new ecs.Ec2TaskDefinition(this, "FE_Task_Definition", {
            executionRole: taskExecutionRole,
            family: 'front-end',
            networkMode: ecs.NetworkMode.BRIDGE,
        });

        const feContainerDef = new ecs.ContainerDefinition(this, 'Next_App_Container', {
            taskDefinition: feTd,
            containerName: 'next-app-container',
            image: ecs.ContainerImage.fromEcrRepository(props.feEcrRepository, 'latest'),
            cpu: 150,
            memoryLimitMiB: 200,           // hard limit
            memoryReservationMiB: 100,     // soft limit
            portMappings: [
                {
                    containerPort: 80,
                    hostPort: 0   // dynamic port mapping
                }
            ],
            essential: true,
            secrets: {
                JWT_SECRET: ecs.Secret.fromSsmParameter(jwtSecretParam),
            },
            environment: {
                NEXT_PUBLIC_URL: `http://${props?.alb.loadBalancerDnsName}`,
                BACKEND_INTERNAL_URL : `http://gql-api`,
                HOST: "0.0.0.0",
                PORT: "80"
            },
            logging: ecs.LogDrivers.awsLogs({
                logGroup: appLogGroup,
                streamPrefix: 'next-app'
            }),
        });

        const beTd = new ecs.Ec2TaskDefinition(this, "BE_Task_Definition",{
            executionRole: taskExecutionRole,
            family: 'back-end',
            networkMode: ecs.NetworkMode.BRIDGE,
        });

        const beContainerDef = new ecs.ContainerDefinition(this, 'GQL_Container', {
            taskDefinition: beTd,
            containerName: 'gql-container',
            image: ecs.ContainerImage.fromEcrRepository(props.beEcrRepository, 'latest'),
            cpu: 150,
            memoryLimitMiB: 250,           // hard limit
            memoryReservationMiB: 100,     // soft limit
            portMappings: [
                {
                    name: 'be-mapping',
                    containerPort: 80,
                    hostPort: 0  // dynamic port mapping
                }
            ],
            essential: true,
            secrets: {
                JWT_SECRET : ecs.Secret.fromSsmParameter(jwtSecretParam),
                DB_ROOT_PASSWORD: ecs.Secret.fromSsmParameter(DbPassParam)
            },
            environment: {
                PUBLIC_URL: `http://${props?.alb.loadBalancerDnsName}`,
                FRONTEND_INTERNAL_URL:  'http://frontend',
                DB_HOST: props.rdsInstance.dbInstanceEndpointAddress,
                DB_PORT: props.rdsInstance.dbInstanceEndpointPort,
                PORT: "80"
            },
            logging: ecs.LogDrivers.awsLogs({
                logGroup: appLogGroup,
                streamPrefix: 'gql-app'
            }),
        });

        // create services
        this.feService = new ecs.Ec2Service(this, "FE_Service", {
            serviceName: 'front-end-service',
            cluster: props.ecsCluster,
            taskDefinition: feTd,
            desiredCount: 1,
            circuitBreaker: {
                enable: true,
                rollback: true
            },
        });

        // setup target tracking scaling for front end service
        const feAutoScaling = this.feService.autoScaleTaskCount({ minCapacity: 1, maxCapacity: 3 });
        feAutoScaling.scaleOnCpuUtilization("Front_Scaling_Policy", {
            targetUtilizationPercent: 80,
            policyName: "front-scaling-policy",
            scaleInCooldown: Duration.minutes(5),
            scaleOutCooldown: Duration.minutes(5),
        })


        this.beService = new ecs.Ec2Service(this, "BE_Service", {
            serviceName: 'back-end-service',
            cluster: props.ecsCluster,
            taskDefinition: beTd,
            desiredCount: 1,
            circuitBreaker: {
                enable: true,
                rollback: true
            },
            cloudMapOptions: {
                cloudMapNamespace: props.ecsNs,
                name: 'gql-api-service',
                dnsRecordType: DnsRecordType.SRV,

                container: beContainerDef, 
                containerPort: 80   // determines which port inside the container to track its app by cloudmap

            }
/*             serviceConnectConfiguration: {
                namespace: props.ecsNs.namespaceName,
                services: [
                    {
                        portMappingName: 'be-mapping',
                        discoveryName: 'gql-api-service',  // will be registered in cloudmap
                        dnsName: 'gql-api',  // will be used instead of the service FQDN
                                             // FQDN = <discoveryName>.<Namspace name>
                    }
                ]
            }, */
        });

        // setup target tracking scaling for back end service
        const beAutoScaling = this.beService.autoScaleTaskCount({ minCapacity: 1, maxCapacity: 3 });
        beAutoScaling.scaleOnCpuUtilization("Back_Scaling_Policy", {
            targetUtilizationPercent: 80,
            policyName: "back-scaling-policy",
            scaleInCooldown: Duration.minutes(5),
            scaleOutCooldown: Duration.minutes(5),
        })


        props.feTG.addTarget(this.feService);
        props.beTG.addTarget(this.beService);        
        
    }
}