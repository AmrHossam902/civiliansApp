import * as cdk from 'aws-cdk-lib';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as sd from 'aws-cdk-lib/aws-servicediscovery';

import { Construct } from "constructs";
import { NetworkProps } from '../props/network-props';
import { ServiceDiscovery } from 'aws-cdk-lib/aws-appmesh';
import { AutoScalingGroup } from 'aws-cdk-lib/aws-autoscaling';
import { StorageProps } from '../props/storage-props';


export class InfrastructureStack extends cdk.Stack {
    alb: elbv2.ApplicationLoadBalancer;
    ecsCluster: ecs.Cluster;
    feTG: elbv2.ApplicationTargetGroup;
    beTG: elbv2.ApplicationTargetGroup;
    ecsNs: sd.IPrivateDnsNamespace;
    albSg: ec2.SecurityGroup;
    ec2Sg: ec2.SecurityGroup;

    constructor(scope: Construct, id: string, props: cdk.StackProps & NetworkProps & StorageProps) {
        super(scope, id, props);

        // extract subnets
        const publicSubnets = props.vpc.publicSubnets;
        const privateSubnets = props.vpc.privateSubnets;

        this.albSg = new ec2.SecurityGroup(this, 'Alb_Sg', {
            vpc: props.vpc,
            securityGroupName: 'alb-sg',
            allowAllOutbound: false
        });
        this.albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.HTTP, "allow all inboud traffic on port 80");

        this.alb = new elbv2.ApplicationLoadBalancer(this, 'Internet_Facing_ALB', {
            vpc: props.vpc,
            vpcSubnets: { subnets: publicSubnets },
            internetFacing: true,
            loadBalancerName: 'alb',
            securityGroup: this.albSg
        });
 
        this.feTG = new elbv2.ApplicationTargetGroup(this, 'FE_TG', {
            vpc: props.vpc,
            targetGroupName: 'front-end-target-group',
            targetType: elbv2.TargetType.INSTANCE,
            protocol: elbv2.ApplicationProtocol.HTTP,
            healthCheck: {
                path: '/api/health',
                protocol: elbv2.Protocol.HTTP,
                healthyHttpCodes: '200-399',
                timeout: cdk.Duration.millis(5000),
                healthyThresholdCount: 2,
                unhealthyThresholdCount: 4
            },
        });

        this.beTG = new elbv2.ApplicationTargetGroup(this, 'BE_TG', {
            vpc: props.vpc,
            targetGroupName: 'backend-target-group',
            targetType: elbv2.TargetType.INSTANCE,
            protocol: elbv2.ApplicationProtocol.HTTP,
            healthCheck: {
                path: '/health',
                protocol: elbv2.Protocol.HTTP,
                healthyHttpCodes: '200-399',
                timeout: cdk.Duration.millis(5000),
                healthyThresholdCount: 2,
                unhealthyThresholdCount: 4
            },  
        });

        const listener = this. alb.addListener('ALB_Listener', {
            protocol: elbv2.ApplicationProtocol.HTTP,
            port: 80,
            open: true,
            defaultTargetGroups: [this.feTG],
        });

        new elbv2.ApplicationListenerRule(this, 'BE_Listener_Rule', {
            priority: 1,
            listener: listener,
            conditions: [elbv2.ListenerCondition.pathPatterns(['/graphql'])],
            action: elbv2.ListenerAction.forward([this.beTG])
        });

        // -----------------
        // ECS Cluster
        // -----------------

        //use this to create a new fresh Cloudmap namespace
        this.ecsNs = new sd.PrivateDnsNamespace(this, "ECS_Namespace", {
            name: 'my-namespace',
            vpc: props.vpc
        });

        //use this to get an existing cloudmap namespace
/*         this.ecsNs = sd.PrivateDnsNamespace.fromPrivateDnsNamespaceAttributes(this, "ECS_Namespace", {
            namespaceName: 'my-namespace',
            namespaceArn: "arn:aws:servicediscovery:us-east-1:597088039155:namespace/ns-v3zz4wls6egjadzb",
            namespaceId: "ns-v3zz4wls6egjadzb",
        }); */

        this.ec2Sg = new ec2.SecurityGroup(this, "Ec2_Sg", {
            vpc: props.vpc,
            securityGroupName: 'ec2-sg'
        });

        const asg = new AutoScalingGroup(this, "ECS_Asg", {
            autoScalingGroupName: 'ecs-asg',
            vpc: props.vpc,
            vpcSubnets: {
                subnets: privateSubnets
            },

            minCapacity: 1,
            maxCapacity: 3,


            instanceType: ec2.InstanceType.of(
                ec2.InstanceClass.T2,
                ec2.InstanceSize.MICRO
            ),

/*             machineImage: ecs.EcsOptimizedImage.amazonLinux2023(ecs.AmiHardwareType.STANDARD, {
                cachedInContext: true,
            }), */

            /* machineImage: ec2.MachineImage.genericLinux({
                "us-east-1": "ami-0d1e2a315b4f9f603"
            }), */ 
            
            machineImage: ecs.EcsOptimizedImage.amazonLinux2023(ecs.AmiHardwareType.STANDARD),

            securityGroup: this.ec2Sg,

            keyPair: ec2.KeyPair.fromKeyPairName(this, "K_Pair", "server")
            
        });

        const ecsCapProvider = new ecs.AsgCapacityProvider(this, "Ecs_Ec2_Provider", {
            autoScalingGroup: asg,
            capacityProviderName: 'ec2-capacity-provider',

            enableManagedScaling: true,
            minimumScalingStepSize: 1,
            maximumScalingStepSize: 1,
            targetCapacityPercent: 75,  // thr (cpu) to scale around
            instanceWarmupPeriod: 120, // 2 mins

        })

        this.ecsCluster = new ecs.Cluster(this, 'ECS_Cluster', {
            vpc: props.vpc,
            clusterName: 'ecs-cluster',
        });

        this.ecsCluster.addAsgCapacityProvider(ecsCapProvider);
        
        
        // connect security groups
        this.albSg.addEgressRule(this.ec2Sg, ec2.Port.allTcp(), "allow traffic only to ec2 ASG");
        this.ec2Sg.addIngressRule(this.albSg, ec2.Port.allTcp(), "allow all ingress from the ALB");
        
        new ec2.CfnSecurityGroupIngress(this, 'Rds_Ingres_Rule', {
            groupId: props.rdsSg.securityGroupId,
            ipProtocol: 'tcp',
            fromPort: 3306,
            toPort: 3306,
            sourceSecurityGroupId: this.ec2Sg.securityGroupId
        });

    }
}
