import { Ec2Service } from "aws-cdk-lib/aws-ecs";

export interface AppProps {
    beService : Ec2Service,
    feService : Ec2Service
}