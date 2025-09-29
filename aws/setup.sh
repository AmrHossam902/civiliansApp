#!/bin/bash
set -e

export AWS_PROFILE=me
#nvm use 20 #check if version exists
#npx cdk bootstrap
echo "deploy network, storage and compute stacks"
npx cdk deploy network-stack storage-stack infra-stack


#build & push next-app initial version
echo "log in to ECR";
aws ecr get-login-password --region us-east-1 | \
  docker login \
    --username AWS \
    --password-stdin 597088039155.dkr.ecr.us-east-1.amazonaws.com


# get url of alb
echo 'extracting alb url'
albDns=$(aws cloudformation describe-stacks \
  --stack-name  infra-stack \
  --query 'Stacks[0].Outputs[?contains(OutputKey,`InternetFacingALB`)].OutputValue' \
  --output text
);
echo $albDns;

# building next app
echo "build next app"
docker build -t next-app-repository \
    --build-arg NEXT_PUBLIC_URL=http://$albDns \
    --build-arg FRONTEND_CONTAINER_PORT=80 \
    ../FrontEnd/.;

docker tag next-app-repository:latest \
    597088039155.dkr.ecr.us-east-1.amazonaws.com/next-app-repository:latest


# building nest app
echo "build nest app"
docker build -t nest-app-repository \
    ../graphql-api/.;

docker tag nest-app-repository:latest \
    597088039155.dkr.ecr.us-east-1.amazonaws.com/nest-app-repository:latest


#pushing images
echo "pushing images"
docker push 597088039155.dkr.ecr.us-east-1.amazonaws.com/next-app-repository:latest
docker push 597088039155.dkr.ecr.us-east-1.amazonaws.com/nest-app-repository:latest


# launch app stack
npx cdk deploy app-stack

# deploy pipelines
npx cdk deploy code-pipeline-stack








