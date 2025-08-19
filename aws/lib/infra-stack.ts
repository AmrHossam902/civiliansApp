import * as cdk from 'aws-cdk-lib';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from "constructs";
import { NetworkProps } from '../props/network-props.interface';


export class InfrastructureStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps & NetworkProps) {
        super(scope, id, props);

        if(!props || !props.vpc)
            throw new Error('VPC_NOT_FOUND');

        // extract subnets
        const publicSubnets = props.vpc.publicSubnets;
        const privateSubnets = props.vpc.privateSubnets;


        const alb = new elbv2.ApplicationLoadBalancer(this, 'Internet_Facing_ALB', {
            vpc: props.vpc,
            vpcSubnets: { subnets: publicSubnets },
            internetFacing: true,
            loadBalancerName: 'alb',
        });

        const feTG = new elbv2.ApplicationTargetGroup(this, 'FE_TG', {
            vpc: props.vpc,
            targetGroupName: 'front-end-target-group',
            targetType: elbv2.TargetType.IP,
            port: 80,
            protocol: elbv2.ApplicationProtocol.HTTP,
            healthCheck: {
                path: '/',
                protocol: elbv2.Protocol.HTTP,
                healthyHttpCodes: '200',
            },
        });

        const beTG = new elbv2.ApplicationTargetGroup(this, 'BE_TG', {
            vpc: props.vpc,
            targetGroupName: 'backend-target-group',
            targetType: elbv2.TargetType.IP,
            port: 80,
            protocol: elbv2.ApplicationProtocol.HTTP,
            healthCheck: {
                path: '/',
                protocol: elbv2.Protocol.HTTP,
                healthyHttpCodes: '200',
            },
        });

        const listener = alb.addListener('ALB_Listener', {
            protocol: elbv2.ApplicationProtocol.HTTP,
            port: 80,
            open: true,
            defaultTargetGroups: [feTG],
        });

        new elbv2.ApplicationListenerRule(this, 'BE_Listener_Rule', {
            priority: 1,
            listener: listener,
            conditions: [elbv2.ListenerCondition.pathPatterns(['/graphql/*'])],
            action: elbv2.ListenerAction.forward([beTG])
        })

        // -----------------
        // ECS Cluster
        // -----------------
        const cluster = new ecs.Cluster(this, 'ECS_Cluster', {
            vpc: props.vpc,
            clusterName: 'ecs-cluster', 
            capacity: {
                instanceType: ec2.InstanceType.of(
                    ec2.InstanceClass.T2,
                    ec2.InstanceSize.MICRO
                ),
                minCapacity: 1,
                maxCapacity: 2,
                vpcSubnets: {
                    subnets: privateSubnets
                },
                autoScalingGroupName: 'ecs-asg',
                // keyPair:
                machineImage: ecs.EcsOptimizedImage.amazonLinux2023(ecs.AmiHardwareType.STANDARD, {
                    cachedInContext: true,
                }),
                allowAllOutbound: true
            }
        });
    }

}
