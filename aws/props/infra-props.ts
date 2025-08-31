import {Cluster} from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancer, ApplicationTargetGroup } from 'aws-cdk-lib/aws-elasticloadbalancingv2';

export interface InfraProps {
    ecsCluster: Cluster;
    alb: ApplicationLoadBalancer;
    feTG: ApplicationTargetGroup,
    beTG: ApplicationTargetGroup
}