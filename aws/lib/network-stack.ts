import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class NetworkStack extends cdk.Stack {

    vpc: ec2.Vpc;
    subnets: ec2.Subnet[];

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        /** //////////////////////
         *          VPC
         */ //////////////////////
        const vpc = new ec2.CfnVPC(this, 'PopulationVpc', {
            cidrBlock: '10.0.0.0/16'
        });

        /** //////////////////////
         *          subnets
         */ //////////////////////
        const publicSubnet1 = new ec2.CfnSubnet(this, 'PublicSubnetA', {
            availabilityZone: 'us-east-1a',
            cidrBlock: '10.0.0.0/20',
            vpcId: vpc.ref,
            mapPublicIpOnLaunch: true
        });

        const publicSubnet2 = new ec2.CfnSubnet(this, 'PublicSubnetB', {
            availabilityZone: 'us-east-1b',
            cidrBlock: '10.0.16.0/20',
            vpcId: vpc.ref,
            mapPublicIpOnLaunch: true
        });

        const privateSubnet1 = new ec2.CfnSubnet(this, 'PrivateSubnetC', {
            availabilityZone: 'us-east-1c',
            cidrBlock: '10.0.32.0/20',
            vpcId: vpc.ref
        });

        const privateSubnet2 = new ec2.Subnet(this, 'PrivateSubnetD', {
            availabilityZone: 'us-east-1d',
            cidrBlock: '10.0.48.0/20',
            vpcId: vpc.ref
        });

        /** //////////////////////
         *          IGW
         */ //////////////////////
        const igw = new ec2.CfnInternetGateway(this, 'igw-pop', {});
        new ec2.CfnVPCGatewayAttachment(this, 'igw-vpc-attachment', {
            vpcId: vpc.ref,
            internetGatewayId: igw.ref,
        });

        /** //////////////////////
         *     routing table (for public subnets)
         */ //////////////////////
        const routeTable = new ec2.CfnRouteTable(this, 'route-table-1', {
            vpcId: vpc.ref,
        });

        new ec2.CfnRoute(this, 'route-table-rule-1', {
            routeTableId: routeTable.ref,
            destinationCidrBlock: '0.0.0.0/0',
            gatewayId: igw.ref,
        });

        // route table associations (for public subnets only)
        new ec2.CfnSubnetRouteTableAssociation(this, 'rt1-public-subnet-a-association', {
            subnetId: publicSubnet1.ref,
            routeTableId: routeTable.ref,
        });

        new ec2.CfnSubnetRouteTableAssociation(this, 'rt1-public-subnet-b-association', {
            subnetId: publicSubnet2.ref,
            routeTableId: routeTable.ref,
        });

        /** //////////////////////////
         *          Nat Gatway
         */ //////////////////////////
        
        const eIp = new ec2.CfnEIP(this, 'nat-Eip');

        const natGW = new ec2.CfnNatGateway(this, 'nat-gw', {
            subnetId: publicSubnet1.ref,
            allocationId: eIp.attrAllocationId
        });


        /** //////////////////////////
         *      route table (private subnet)
        */ //////////////////////////
        const routeTable2 = new ec2.CfnRouteTable(this, 'route-table-2', {
            vpcId: vpc.ref,
        });

        new ec2.CfnRoute(this, 'route-table-2-rule-1', {
            routeTableId: routeTable2.ref,
            destinationCidrBlock: '0.0.0.0/0',
            natGatewayId: natGW.ref,
        });


        // subnet associations
        new ec2.CfnSubnetRouteTableAssociation(this, 'rt2-private-subnet-c-association', {
            subnetId: privateSubnet1.ref,
            routeTableId: routeTable2.ref,
        });

        new ec2.CfnSubnetRouteTableAssociation(this, 'rt2-private-subnet-d-association', {
            subnetId: privateSubnet2.subnetId,
            routeTableId: routeTable2.ref,
        });



        /** /////////////////////////
         *        security Groups
         */ /////////////////////////
        const albSG = new ec2.CfnSecurityGroup(this, 'PopulationALBSecurityGroup', {
            vpcId: vpc.ref,
            groupDescription: 'this SG controls traffic going into/out of the ALB',
            groupName: 'civilians-alb-sg',
        });
    
        const feSG = new ec2.CfnSecurityGroup(this, 'FrontEndSecurityGroup', {
            vpcId: vpc.ref,
            groupDescription: 'this SG controls traffic going into the frontend service',
            groupName: 'civilians-frontend-sg',
        });
    
        const beSG = new ec2.CfnSecurityGroup(this, 'BackEndSecurityGroup', {
            vpcId: vpc.ref,
            groupDescription: 'this SG controls traffic going into the backend service',
            groupName: 'civilians-backend-sg'
        });
    
        const dbSG = new ec2.CfnSecurityGroup(this, 'DatabaseSecurityGroup', {
            vpcId: vpc.ref,
            groupDescription: 'this SG controls traffic going into the RDS instance',
            groupName: 'civilians-rds-sg',
        });
    
        // SG rules
        new ec2.CfnSecurityGroupIngress(this, 'ALBIngressRule1', {
            groupId: albSG.ref,
            ipProtocol: 'tcp',
            cidrIp: "0.0.0.0/0",
            fromPort: 80,
            toPort: 80
        });

        new ec2.CfnSecurityGroupEgress(this, 'ALBEgressRule1',{
            groupId: albSG.ref,
            ipProtocol: 'tcp',
            destinationSecurityGroupId: feSG.ref,
            fromPort: 80,
            toPort: 80,
        });

  
        new ec2.CfnSecurityGroupEgress(this, "ALBEgressRule2", {
            groupId: albSG.ref,
            destinationSecurityGroupId: beSG.ref,
            ipProtocol: "tcp",
            fromPort: 80,
            toPort: 80,
        });

    
        new ec2.CfnSecurityGroupIngress(this, "FEIngressRule1", {
            groupId: feSG.ref,
            sourceSecurityGroupId: albSG.ref,
            ipProtocol: "tcp",
            fromPort: 80,
            toPort: 80,
        });

    
        new ec2.CfnSecurityGroupEgress(this, "FEEngressRule1", {
            groupId: feSG.ref,
            destinationSecurityGroupId: beSG.ref,
            ipProtocol: "tcp",
            fromPort: 80,
            toPort: 80,
        });

    
        new ec2.CfnSecurityGroupIngress(this, "BEIngressRule1", {
            groupId: beSG.ref,
            sourceSecurityGroupId: albSG.ref,
            ipProtocol: "tcp",
            fromPort: 80,
            toPort: 80,
        });

    
        new ec2.CfnSecurityGroupIngress(this, "BEIngressRule2", {
            groupId: beSG.ref,
            sourceSecurityGroupId: feSG.ref,
            ipProtocol: "tcp",
            fromPort: 80,
            toPort: 80,
        });


        new ec2.CfnSecurityGroupEgress(this, "BEEngressRule1", {
            groupId: beSG.ref,
            destinationSecurityGroupId: dbSG.ref,
            ipProtocol: "tcp",
            fromPort: 3306,
            toPort: 3306,
        });


        new ec2.CfnSecurityGroupIngress(this, "DBIngressRule1", {
            groupId: dbSG.ref,
            sourceSecurityGroupId: beSG.ref,
            ipProtocol: "tcp",
            fromPort: 3306,
            toPort: 3306,
        });

        new ec2.CfnSecurityGroupEgress(this, "DBEngressRule1", {
            groupId: dbSG.ref,
            cidrIp: "0.0.0.0/0",
            ipProtocol: "-1",
        });
  


/* 
        albSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));
        albSG.addEgressRule(feSG, ec2.Port.tcp(80));
        albSG.addEgressRule(beSG, ec2.Port.tcp(80));
    
        feSG.addIngressRule(albSG, ec2.Port.tcp(80));
        feSG.addEgressRule(beSG, ec2.Port.tcp(80));
    
        beSG.addIngressRule(albSG, ec2.Port.tcp(80));
        beSG.addIngressRule(feSG, ec2.Port.tcp(80));
        beSG.addEgressRule(dbSG, ec2.Port.tcp(3306));
    
        dbSG.addIngressRule(beSG, ec2.Port.tcp(3306)); */
    }
}