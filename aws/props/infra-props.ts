import {Cluster} from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancer, ApplicationTargetGroup } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { IPrivateDnsNamespace } from 'aws-cdk-lib/aws-servicediscovery';

export interface InfraProps {
    ecsCluster: Cluster,
    alb: ApplicationLoadBalancer,
    feTG: ApplicationTargetGroup,
    beTG: ApplicationTargetGroup,
    ecsNs: IPrivateDnsNamespace
}