
import * as cdk from 'aws-cdk-lib';
import { Artifact, ArtifactPath, ExecutionMode, Pipeline, PipelineType } from 'aws-cdk-lib/aws-codepipeline';
import { CodeBuildAction, CodeStarConnectionsSourceAction, EcrBuildAndPublishAction, EcsDeployAction, RegistryType } from 'aws-cdk-lib/aws-codepipeline-actions';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as codeBuild from 'aws-cdk-lib/aws-codebuild';
import { Construct } from 'constructs';
import { StorageProps } from '../../props/storage-props';
import { AppProps } from '../../props/app-props';
import { IBaseService } from 'aws-cdk-lib/aws-ecs';
import { PipelineProject } from 'aws-cdk-lib/aws-codebuild';

export class DeployFrontEndPipeline extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps & StorageProps & AppProps) {
    super(scope, id, props);
    
    const artifactsBucket = new s3.Bucket(this, 'Artifacts_Bucket', {
      bucketName: 'artifacts-bucket',
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const sourceCodeOutput = new Artifact();
   
    const sourceAction = new CodeStarConnectionsSourceAction({
      actionName: 'source action',
      output: sourceCodeOutput,
      connectionArn: 'arn:aws:codeconnections:us-east-1:597088039155:connection/6a47bcd5-fcc5-4be0-9e65-4aa58bf9e6f8',
      owner: "amrhossam902",
      repo: "amrhossam902/civiliansapp",
      branch: "master",
      triggerOnPush: true,
    });

    const imgDefArtifact = new Artifact();
    const codeBuildProject = new codeBuild.PipelineProject(this, 'Code_Build_Project', {
      projectName: 'code-build-project',
      environmentVariables: {
        ECR_REPO: { value: props?.feEcrRepository.repositoryName },
      },
      buildSpec: codeBuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          build: {
            commands: [
              "echo 'generating image definitions file'",
              "printf '[{\"name\":\"next-app-container\",\"imageUri\":\"%s.dkr.ecr.%s.amazonaws.com/%s:latest\"}]' $AWS_ACCOUNT_ID $AWS_DEFAULT_REGION $ECR_REPO > imagedefinitions.json"
            ]
          }
        },
        artifacts: {
          files: ["imagedefinitions.json"]
        }
      })
    });

    const buildAction = new EcrBuildAndPublishAction({
      actionName: 'build next app',
      input: sourceCodeOutput,
      repositoryName: props?.feEcrRepository.repositoryName as string,
      registryType: RegistryType.PRIVATE,
      dockerfileDirectoryPath: '/FrontEnd/dockerfile'
    });

    const deployAction = new EcsDeployAction({
      actionName: 'deploy frontend service',
      service: props?.feService as IBaseService,
      input: imgDefArtifact,
      imageFile: new ArtifactPath(imgDefArtifact, 'imagedefinitions.json')
    });


    new Pipeline(this, 'front-end-pipeline', {
        pipelineName: 'front-end-pipeline',
        pipelineType: PipelineType.V2,
        executionMode: ExecutionMode.SUPERSEDED,

        stages: [
          {
            stageName: "pulling source",
            actions: [
              sourceAction
            ]
          },
          {
            stageName: "building image",
            actions: [
              buildAction
            ]
          },
          {
            stageName: "generating image def file",
            actions: [
              new CodeBuildAction({
                actionName: 'generate image def file',
                project: codeBuildProject,
                input: null as any, // no need for input artifact
                outputs: [imgDefArtifact]
              })
            ]
          },
          {
            stageName: "deploying app",
            actions: [
              deployAction
            ]
          }
        ]

    });


    // building pipeline for backend
 
    const BEsourceAction = new CodeStarConnectionsSourceAction({
      actionName: 'source action',
      output: sourceCodeOutput,
      connectionArn: 'arn:aws:codeconnections:us-east-1:597088039155:connection/6a47bcd5-fcc5-4be0-9e65-4aa58bf9e6f8',
      owner: "amrhossam902",
      repo: "amrhossam902/civiliansapp",
      branch: "master",
      triggerOnPush: true,
    });

    const BEimgDefArtifact = new Artifact();
    const BEcodeBuildProject = new codeBuild.PipelineProject(this, 'BE_Code_Build_Project', {
      projectName: 'be-code-build-project',
      environmentVariables: {
        ECR_REPO: { value: props?.beEcrRepository.repositoryName },
      },
      buildSpec: codeBuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          build: {
            commands: [
              "echo 'generating image definitions file'",
              "printf '[{\"name\":\"gql-container\",\"imageUri\":\"%s.dkr.ecr.%s.amazonaws.com/%s:latest\"}]' $AWS_ACCOUNT_ID $AWS_DEFAULT_REGION $ECR_REPO > imagedefinitions.json"
            ]
          }
        },
        artifacts: {
          files: ["imagedefinitions.json"]
        }
      })
    });

    const BEbuildAction = new EcrBuildAndPublishAction({
      actionName: 'backend build action',
      input: sourceCodeOutput,
      repositoryName: props?.beEcrRepository.repositoryName as string,
      registryType: RegistryType.PRIVATE,
      dockerfileDirectoryPath: '/graphql-api/dockerfile'
    });

    const BEdeployAction = new EcsDeployAction({
      actionName: 'deploy frontend service',
      service: props?.feService as IBaseService,
      input: imgDefArtifact,
      imageFile: new ArtifactPath(imgDefArtifact, 'imagedefinitions.json')
    });

    new Pipeline(this, 'back-end-pipeline', {
        pipelineName: 'back-end-pipeline',
        pipelineType: PipelineType.V2,
        executionMode: ExecutionMode.SUPERSEDED,

        stages: [
          {
            stageName: "pulling source",
            actions: [
              BEsourceAction
            ]
          },
          {
            stageName: "building image",
            actions: [
              BEbuildAction
            ]
          },
          {
            stageName: "generating image def file",
            actions: [
              new CodeBuildAction({
                actionName: 'generate image def file',
                project: BEcodeBuildProject,
                input: null as any, // no need for input artifact
                outputs: [BEimgDefArtifact]
              })
            ]
          },
          {
            stageName: "deploying app",
            actions: [
              BEdeployAction
            ]
          }
        ]

    });

  }

}