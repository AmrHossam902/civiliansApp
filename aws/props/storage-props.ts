import { DatabaseInstance } from "aws-cdk-lib/aws-rds";
import { Repository } from "aws-cdk-lib/aws-ecr";

export interface StorageProps {
    rdsInstance: DatabaseInstance;
    feEcrRepository: Repository;
    beEcrRepository: Repository;
}