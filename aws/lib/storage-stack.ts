import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { NetworkProps } from '../props/network-props';
import * as ecr from 'aws-cdk-lib/aws-ecr';

export class StorageStack extends cdk.Stack {

    rdsInstance: rds.DatabaseInstance;
    feEcrRepository: ecr.Repository;
    beEcrRepository: ecr.Repository;

    constructor(scope: Construct, id: string, props: cdk.StackProps & NetworkProps) {
        super(scope, id, props);

        if(!props.vpc)
            throw new Error('VPC_NOT_FOUND');

        // extract private subnet 
        const privateSubnets = props.vpc.privateSubnets;
        
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
            databaseName: 'civiliansDb',
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            port: 3306
        });

        this.feEcrRepository = new ecr.Repository(this, "FE_Repository", {
            repositoryName: 'next-app-repository',
            removalPolicy: cdk.RemovalPolicy.DESTROY ,
            emptyOnDelete: true
        });

        this.beEcrRepository = new ecr.Repository(this, "BE_Repository", {
            repositoryName: 'nest-app-repository',
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            emptyOnDelete: true
        });

    }
}