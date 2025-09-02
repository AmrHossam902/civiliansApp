import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { InfraProps } from "../props/infra-props";
import { StorageProps } from "../props/storage-props";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { Port } from "aws-cdk-lib/aws-ec2";

export class AppStack extends Stack {
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

        // define task definintions
        const feTd = new ecs.Ec2TaskDefinition(this, "FE_Task_Definition", {
            executionRole: taskExecutionRole,
            family: 'front-end',
            networkMode: ecs.NetworkMode.BRIDGE,
        });

        feTd.addContainer('Next_App_Container', {
            containerName: 'next-app-container',
            image: ecs.ContainerImage.fromEcrRepository(props?.feEcrRepository),
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
            environment: {
                NEXT_PUBLIC_API_URL: `http://${props?.alb.loadBalancerDnsName}`,
                API_URL : `http://gql-api`,
                NEXT_PUBLIC_FRONTEND_URL: `http://${props?.alb.loadBalancerDnsName}`,
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

        beTd.addContainer('GQL_Container', {
            containerName: 'gql-container',
            image: ecs.ContainerImage.fromEcrRepository(props?.beEcrRepository),
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
            environment: {
                PUBLIC_FRONTEND_URL: `http://${props?.alb.loadBalancerDnsName}`,
                FRONT_URL:  'http://frontend',
                DB_HOST: props.rdsInstance.dbInstanceEndpointAddress,
                DB_PORT: props.rdsInstance.dbInstanceEndpointPort,
                DB_ROOT_PASSWORD: 'pwivY5aW8EPPtWB',
                PORT: "80",
            },
            logging: ecs.LogDrivers.awsLogs({
                logGroup: appLogGroup,
                streamPrefix: 'gql-app'
            }),
        });

        // create services
        const feService = new ecs.Ec2Service(this, "FE_Service", {
            serviceName: 'front-end-service',
            cluster: props.ecsCluster,
            taskDefinition: feTd,
            desiredCount: 1,
        });

        const beService = new ecs.Ec2Service(this, "BE_Service", {
            serviceName: 'back-end-service',
            cluster: props.ecsCluster,
            taskDefinition: beTd,
            desiredCount: 1,
            serviceConnectConfiguration: {
                namespace: props.ecsNs.namespaceName,
                services: [
                    {
                        portMappingName: 'be-mapping',
                        discoveryName: 'gql-api-service',  // will be registered in cloudmap
                        dnsName: 'gql-api',  // will be used instead of the service FQDN
                                             // FQDN = <discoveryName>.<Namspace name>
                    }
                ]
            }
        });

        props.feTG.addTarget(feService);
        props.beTG.addTarget(beService);        
 
        feService.connections.allowFrom(props.alb, Port.allTcp());
        beService.connections.allowFrom(props.alb, Port.allTcp());

        // this way we force cloudformation to export the SG of rds
/*         props.rdsInstance.connections.securityGroups[0]
        .addIngressRule(beService.connections.securityGroups[0], Port.tcp(3306));
         */
    }
}