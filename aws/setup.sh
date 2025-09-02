#!/bin/bash

export AWS_PROFILE=me
nvm use 20 #check if version exists
npx cdk bootstrap
npx cdk deploy network-stack storage-stack