#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack-l2';
import { InfrastructureStack } from '../lib/infra-stack';
import { StorageStack } from '../lib/storage-stack';
import { AppStack } from '../lib/app-stack';

const app = new cdk.App();

const netStack = new NetworkStack(app, 'network-stack', {
  env: { account: "597088039155",  region: "us-east-1" }
});
const storageStack = new StorageStack(app, 'storage-stack', { 
  vpc: netStack.vpc,
  env: { account: "597088039155",  region: "us-east-1" }
});
const infraStack = new InfrastructureStack(app, 'infra-stack', { 
  vpc: netStack.vpc,
  env: { account: "597088039155",  region: "us-east-1" }
});

new AppStack(app, 'app-stack', {
  env: { account: "597088039155",  region: "us-east-1" },
  
  // storage props
  rdsInstance: storageStack.rdsInstance,
  feEcrRepository: storageStack.feEcrRepository,
  beEcrRepository: storageStack.beEcrRepository,

  //compute props
  ecsCluster: infraStack.ecsCluster,
  alb: infraStack.alb,
  feTG: infraStack.feTG,
  beTG: infraStack.beTG

})

