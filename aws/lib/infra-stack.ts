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


export class InfrastructureStack extends cdk.Stack {
    alb: elbv2.ApplicationLoadBalancer;
    ecsCluster: ecs.Cluster;
    feTG: elbv2.ApplicationTargetGroup;
    beTG: elbv2.ApplicationTargetGroup;
    ecsNs: sd.IPrivateDnsNamespace

    constructor(scope: Construct, id: string, props?: cdk.StackProps & NetworkProps) {
        super(scope, id, props);

        if(!props || !props.vpc)
            throw new Error('VPC_NOT_FOUND');

        // extract subnets
        const publicSubnets = props.vpc.publicSubnets;
        const privateSubnets = props.vpc.privateSubnets;


        this.alb = new elbv2.ApplicationLoadBalancer(this, 'Internet_Facing_ALB', {
            vpc: props.vpc,
            vpcSubnets: { subnets: publicSubnets },
            internetFacing: true,
            loadBalancerName: 'alb',
        });
 
        this.feTG = new elbv2.ApplicationTargetGroup(this, 'FE_TG', {
            vpc: props.vpc,
            targetGroupName: 'front-end-target-group',
            targetType: elbv2.TargetType.INSTANCE,
            protocol: elbv2.ApplicationProtocol.HTTP,
            healthCheck: {
                path: '/',
                protocol: elbv2.Protocol.HTTP,
                healthyHttpCodes: '200-399',
            },
        });

        this.beTG = new elbv2.ApplicationTargetGroup(this, 'BE_TG', {
            vpc: props.vpc,
            targetGroupName: 'backend-target-group',
            targetType: elbv2.TargetType.INSTANCE,
            protocol: elbv2.ApplicationProtocol.HTTP,
            healthCheck: {
                path: '/',
                protocol: elbv2.Protocol.HTTP,
                healthyHttpCodes: '200-399',
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
            conditions: [elbv2.ListenerCondition.pathPatterns(['/graphql/*'])],
            action: elbv2.ListenerAction.forward([this.beTG])
        })

        // -----------------
        // ECS Cluster
        // -----------------

        //use this to create a new fresh Cloudmap namespace
        /* const ecsNs = new sd.PrivateDnsNamespace(this, "ECS_Namespace", {
            name: 'ecs-clusterns',
            vpc: props.vpc
        }); */

        //use this to get an existing cloudmap namespace
        this.ecsNs = sd.PrivateDnsNamespace.fromPrivateDnsNamespaceAttributes(this, "ECS_Namespace", {
            namespaceName: 'my-namespace',
            namespaceArn: "arn:aws:servicediscovery:us-east-1:597088039155:namespace/ns-v3zz4wls6egjadzb",
            namespaceId: "ns-v3zz4wls6egjadzb",
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

            machineImage: ecs.EcsOptimizedImage.amazonLinux2023(ecs.AmiHardwareType.STANDARD, {
                cachedInContext: true,
            }),

            allowAllOutbound: true
            
        });

        const ecsCapProvider = new ecs.AsgCapacityProvider(this, "Ecs_Ec2_Provider", {
            autoScalingGroup: asg,
            capacityProviderName: 'ec2-capacity-provider',
            enableManagedScaling: true,

            minimumScalingStepSize: 1,
            maximumScalingStepSize: 1,
            targetCapacityPercent: 75,  // thr (cpu) to scale around

        })

        this.ecsCluster = new ecs.Cluster(this, 'ECS_Cluster', {
            vpc: props.vpc,
            clusterName: 'ecs-cluster'
        });

        this.ecsCluster.addAsgCapacityProvider(ecsCapProvider);

    }
}
