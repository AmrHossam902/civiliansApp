import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class NetworkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /** //////////////////////
     *          VPC
     */ //////////////////////
    const vpc = new ec2.Vpc(this, 'PopulationVpc', {
      vpcName: 'PopulationVpc',
      ipAddresses: ec2.IpAddresses.cidr('150.0.0.0/16'),
    });

    /** //////////////////////
     *          subnets
     */ //////////////////////
    const publicSubnet1 = new ec2.Subnet(this, 'public-subnet-a', {
      availabilityZone: 'us-east-1a',
      cidrBlock: '150.0.0.0/20',
      vpcId: vpc.vpcId,
      mapPublicIpOnLaunch: true
    });

    const publicSubnet2 = new ec2.Subnet(this, 'public-subnet-b', {
      availabilityZone: 'us-east-1b',
      cidrBlock: '150.0.16.0/20',
      vpcId: vpc.vpcId,
      mapPublicIpOnLaunch: true
    });

    const privateSubnet1 = new ec2.Subnet(this, 'private-subnet-c', {
      availabilityZone: 'us-east-1c',
      cidrBlock: '150.0.32.0/20',
      vpcId: vpc.vpcId 
    });

    const privateSubnet2 = new ec2.Subnet(this, 'private-subnet-d', {
      availabilityZone: 'us-east-1d',
      cidrBlock: '150.0.48.0/20',
      vpcId: vpc.vpcId 
    });

    /** //////////////////////
     *          IGW
     */ //////////////////////
    const igw = new ec2.CfnInternetGateway(this, 'igw', {});
    new ec2.CfnVPCGatewayAttachment(this, 'igw-vpc-attachment', {
      vpcId: vpc.vpcId,
      internetGatewayId: igw.ref,
    });

    /** //////////////////////
     *     routing table (for public subnets)
     */ //////////////////////
    const routeTable = new ec2.CfnRouteTable(this, 'route-table-1', {
      vpcId: vpc.vpcId,
    });

    new ec2.CfnRoute(this, 'route-table-rule-1', {
      routeTableId: routeTable.ref,
      destinationCidrBlock: '0.0.0.0/0',
      gatewayId: igw.ref,
    });

    // route table associations (for public subnets only)
    new ec2.CfnSubnetRouteTableAssociation(this, 'rt1-public-subnet-a-association', {
      subnetId: publicSubnet1.subnetId,
      routeTableId: routeTable.ref,
    });

    new ec2.CfnSubnetRouteTableAssociation(this, 'rt1-public-subnet-b-association', {
      subnetId: publicSubnet2.subnetId,
      routeTableId: routeTable.ref,
    });

  }
}