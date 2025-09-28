import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class NetworkStack extends cdk.Stack {
    vpc: ec2.Vpc;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        /**
         * creates vpc + subnets + IGW + NatGW + routing tables
         */
        this.vpc = new ec2.Vpc(this, "Main_VPC", {
            availabilityZones: ["us-east-1a", "us-east-1b"],
            vpcName: "main-vpc",
            ipProtocol: ec2.IpProtocol.IPV4_ONLY,
            ipAddresses: ec2.IpAddresses.cidr('150.0.0.0/16'),
            natGateways: 1,
            natGatewayProvider: ec2.NatProvider.gateway(),
            natGatewaySubnets: { 
                subnetType: ec2.SubnetType.PUBLIC
            },
            subnetConfiguration: [
                {
                    subnetType: ec2.SubnetType.PUBLIC,
                    cidrMask: 20,
                    name: 'public'
                },
                {
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                    cidrMask: 20,
                    name: 'private'
                }
            ]
        });

    }

}