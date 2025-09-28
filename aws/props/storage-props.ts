import { DatabaseInstance } from "aws-cdk-lib/aws-rds";
import { Repository } from "aws-cdk-lib/aws-ecr";
import { SecurityGroup } from "aws-cdk-lib/aws-ec2";

export interface StorageProps {
    rdsInstance: DatabaseInstance;
    rdsSg: SecurityGroup;
    feEcrRepository: Repository;
    beEcrRepository: Repository;
}