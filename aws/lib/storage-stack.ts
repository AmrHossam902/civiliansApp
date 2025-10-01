import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { NetworkProps } from '../props/network-props';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecr_assets from 'aws-cdk-lib/aws-ecr-assets';
import path from 'path';

export class StorageStack extends cdk.Stack {

    rdsInstance: rds.DatabaseInstance;
    rdsSg: ec2.SecurityGroup; 
    feEcrRepository: ecr.Repository;
    beEcrRepository: ecr.Repository;

    constructor(scope: Construct, id: string, props: cdk.StackProps & NetworkProps) {
        super(scope, id, props);

        // extract private subnet 
        const privateSubnets = props.vpc.privateSubnets;
        
        this.rdsSg = new ec2.SecurityGroup(this, 'Rds_Sg', {
            vpc: props.vpc,
            securityGroupName: 'rds-sg',
            allowAllOutbound: true
        });

        this.rdsInstance = new rds.DatabaseInstance(this, 'rds-instance', {
            vpc: props.vpc,
            vpcSubnets: { subnets: privateSubnets },
            engine: rds.DatabaseInstanceEngine.mysql({
                version: rds.MysqlEngineVersion.VER_8_0_41,
            }),
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
            allocatedStorage: 20,
            maxAllocatedStorage: 20,
            multiAz: false,
            publiclyAccessible: false,
            deletionProtection: false,
            credentials: rds.Credentials.fromPassword('root', cdk.SecretValue.unsafePlainText('pwivY5aW8EPPtWB')),
            databaseName: 'civilDb',
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            port: 3306,
            securityGroups: [this.rdsSg]
        });

        this.feEcrRepository = new ecr.Repository(this, "FE_Repository", {
            repositoryName: 'next-app-repository',
            removalPolicy: cdk.RemovalPolicy.DESTROY ,
            emptyOnDelete: true,
        });

        this.beEcrRepository = new ecr.Repository(this, "BE_Repository", {
            repositoryName: 'nest-app-repository',
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            emptyOnDelete: true,
        });

    }
}