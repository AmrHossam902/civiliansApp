
import * as cdk from 'aws-cdk-lib';
import { Artifact, ArtifactPath, ExecutionMode, Pipeline, PipelineType, ProviderType } from 'aws-cdk-lib/aws-codepipeline';
import { CodeBuildAction, CodeStarConnectionsSourceAction, EcrBuildAndPublishAction, EcsDeployAction, RegistryType } from 'aws-cdk-lib/aws-codepipeline-actions';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as codeBuild from 'aws-cdk-lib/aws-codebuild';
import { Construct } from 'constructs';
import { StorageProps } from '../../props/storage-props';
import { AppProps } from '../../props/app-props';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { CompositePrincipal, ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { InfraProps } from '../../props/infra-props';

export class CodePipelineStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props: cdk.StackProps & StorageProps & InfraProps & AppProps) {
    super(scope, id, props);

    const artifactsBucket = new s3.Bucket(this, 'Artifacts_Bucket', {
      bucketName: 'my-project-artifacts-bucket',
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const pipelineRole = new Role(this, 'Pipeline_Role', {
        assumedBy: new CompositePrincipal(
            new ServicePrincipal('codebuild.amazonaws.com'),
            new ServicePrincipal('codepipeline.amazonaws.com')
        ),
        roleName: 'pipeline-role'
    });

    pipelineRole.addManagedPolicy(
        ManagedPolicy.fromAwsManagedPolicyName('AWSCodePipeline_FullAccess')
    );
    pipelineRole.addManagedPolicy(
        ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess")
    );
    pipelineRole.addManagedPolicy(
        ManagedPolicy.fromAwsManagedPolicyName("AWSCodeBuildAdminAccess")
    );
    pipelineRole.addManagedPolicy(
        ManagedPolicy.fromAwsManagedPolicyName("AmazonECS_FullAccess")
    );

    pipelineRole.addManagedPolicy(
        ManagedPolicy.fromAwsManagedPolicyName("AmazonEC2ContainerRegistryPowerUser")
    )


    /** ///////////////
     * Frontend pipeline 
     */ /////////////////

    const frontEndSourceCodeArtifact = new Artifact();
   

    const frontSourceAction = new CodeStarConnectionsSourceAction({
        actionName: 'source-action',
        output: frontEndSourceCodeArtifact,
        connectionArn: 'arn:aws:codeconnections:us-east-1:597088039155:connection/fbbb8ebb-4db4-4336-8996-827181a25b90',
        owner: "AmrHossam902",
        repo: "civiliansApp",
        branch: "master",
        triggerOnPush: true,
    });


    // Use codebuild.PipelineProject and codebuild.BuildSpec
    const frontEndCodeBuildProject = new codeBuild.PipelineProject(this, 'Front_Code_Build_Project', {
        projectName: 'front-code-build-project',      
        environmentVariables: {
            ECR_REPO: { value:  props.feEcrRepository.repositoryName},
            REPO_URI : { value : props.feEcrRepository.repositoryUri },
            ACCOUNT_ID : { value : this.account },
            ALB_DNS_NAME: { value: props.alb.loadBalancerDnsName }
        },
        environment: {
            buildImage: codeBuild.LinuxBuildImage.STANDARD_7_0,
            computeType: codeBuild.ComputeType.SMALL,
            privileged: true,
        },
        role: pipelineRole,
        buildSpec: codeBuild.BuildSpec.fromObject({
            version: "0.2",
            phases: {
                pre_build: {
                    commands: [
                        'cd FrontEnd',
                        'aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com',                                                                                                    
                        'IMAGE_TAG=$CODEBUILD_RESOLVED_SOURCE_VERSION'
                    ]
                },
                build: {
                    commands: [
                        `docker build -t $REPO_URI:$IMAGE_TAG \
                            --build-arg NEXT_PUBLIC_URL=http://$ALB_DNS_NAME \
                            --build-arg FRONTEND_CONTAINER_PORT=80 \
                            .`,
                        "docker tag $REPO_URI:$IMAGE_TAG $REPO_URI:latest"
                    ]
                },
                post_build: {
                    commands: [
                        "docker push $REPO_URI:$IMAGE_TAG",
                        "docker push $REPO_URI:latest",
                        "echo 'generating image definitions file'",
                        "printf '[{\"name\":\"next-app-container\",\"imageUri\":\"%s.dkr.ecr.%s.amazonaws.com/%s:latest\"}]' $ACCOUNT_ID $AWS_DEFAULT_REGION $ECR_REPO > imagedefinitions.json"
                    ]
                }
            },
            artifacts: {
                'base-directory': "FrontEnd",
                files: ["imagedefinitions.json"],
            }
        })
    });

    const imageDefArtifact = new Artifact('imageDef');

    new Pipeline(this, 'FrontEnd_Pipeline', {
        artifactBucket: artifactsBucket,
        pipelineName: 'frontend-pipeline',
        pipelineType: PipelineType.V2,
        role: pipelineRole,
        executionMode: ExecutionMode.SUPERSEDED,
        usePipelineRoleForActions: true,
        stages: [
            {
                stageName: 'Pulling_Source',
                actions:[
                    frontSourceAction
                ]
            },{
                stageName: 'Build',
                actions: [
                    new CodeBuildAction({
                        actionName: 'build-action',
                        project: frontEndCodeBuildProject,
                        input: frontEndSourceCodeArtifact,
                        outputs: [imageDefArtifact]
                    })
                ]
            },
            {
                stageName: 'Deploy',
                actions: [
                    new EcsDeployAction({
                        actionName: 'deploy-Next-app',
                        imageFile: new ArtifactPath(imageDefArtifact, "imagedefinitions.json"),
                        service: props.feService,
                    })
                ]
            }
        ],
        triggers: [
            {
                providerType: ProviderType.CODE_STAR_SOURCE_CONNECTION,
                gitConfiguration: {
                    sourceAction: frontSourceAction,
                    pushFilter: [{
                        branchesIncludes: ['master'],
                        filePathsIncludes: ['FrontEnd/**']
                    }]
                }
            }
        ],
    });



    /** ///////////////
     * Backend pipeline 
     */ ///////////////

    const BESourceCodeArtifact = new Artifact();
   
    const BEsourceAction = new CodeStarConnectionsSourceAction({
      actionName: 'source-action',
      output: BESourceCodeArtifact,
      connectionArn: 'arn:aws:codeconnections:us-east-1:597088039155:connection/fbbb8ebb-4db4-4336-8996-827181a25b90',
      owner: "AmrHossam902",
      repo: "civiliansApp",
      branch: "master",
      triggerOnPush: true,
    });

    const BEimgDefArtifact = new Artifact();
    const BEcodeBuildProject = new codeBuild.PipelineProject(this, 'BE_Code_Build_Project', {
        projectName: 'be-code-build-project',
        environmentVariables: {
            ECR_REPO: { value: props.beEcrRepository.repositoryName },
            REPO_URI : { value : props.beEcrRepository.repositoryUri },
            ACCOUNT_ID : { value : this.account },
        },
        environment: {
            buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
            computeType: codebuild.ComputeType.SMALL,
            privileged: true,
        },
        role: pipelineRole,
        buildSpec: codeBuild.BuildSpec.fromObject({
            version: "0.2",
            phases: {
                pre_build: {
                    commands: [
                        'cd graphql-api',
                        'aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com',                                                                                                    
                        'IMAGE_TAG=$CODEBUILD_RESOLVED_SOURCE_VERSION'
                    ]
                },
                build: {
                    commands: [
                        "docker build -t $REPO_URI:$IMAGE_TAG .",
                        "docker tag $REPO_URI:$IMAGE_TAG $REPO_URI:latest"
                    ]
                },
                post_build: {
                    commands: [
                        "docker push $REPO_URI:$IMAGE_TAG",
                        "docker push $REPO_URI:latest",
                        "echo 'generating image definitions file'",
                        "printf '[{\"name\":\"gql-container\",\"imageUri\":\"%s.dkr.ecr.%s.amazonaws.com/%s:latest\"}]' $ACCOUNT_ID $AWS_DEFAULT_REGION $ECR_REPO > imagedefinitions.json"
                    ]
                }
            },
            artifacts: {
                'base-directory': "graphql-api",
                files: ["imagedefinitions.json"],
            }
        })
    });

    new Pipeline(this, 'BackEnd-pipeline', {
        pipelineName: 'back-end-pipeline',
        pipelineType: PipelineType.V2,
        executionMode: ExecutionMode.SUPERSEDED,
        usePipelineRoleForActions: true,
        artifactBucket: artifactsBucket,
        role: pipelineRole,

        stages: [
            {
                stageName: "Pulling_Source",
                actions: [
                BEsourceAction
                ]
            },{
                stageName: 'Build',
                actions: [
                    new CodeBuildAction({
                        actionName: 'build-action',
                        project: BEcodeBuildProject,
                        input: BESourceCodeArtifact,
                        outputs: [BEimgDefArtifact]
                    })
                ]
            },
            {
                stageName: "Deploy",
                actions: [
                    new EcsDeployAction({
                        actionName: 'deploy-nestJs-app',
                        service: props.beService,
                        imageFile: new ArtifactPath(BEimgDefArtifact, 'imagedefinitions.json')
                    })
                ]
            }
        ]

    });

  }

}