#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
import { InfrastructureStack } from '../lib/infra-stack';
import { StorageStack } from '../lib/storage-stack';
import { AppStack } from '../lib/app-stack';
import { CodePipelineStack } from '../lib/pipelines/code-pipeline-stack';
import { StorageProps } from '../props/storage-props';
import { InfraProps } from '../props/infra-props';
import { AppProps } from '../props/app-props';

const app = new cdk.App();

const netStack = new NetworkStack(app, 'network-stack', {
  env: { account: "597088039155",  region: "us-east-1" }
});

const storageStack = new StorageStack(app, 'storage-stack', { 
  vpc: netStack.vpc,
  env: { account: "597088039155",  region: "us-east-1" }
});

const storageResources : StorageProps = {
  rdsInstance: storageStack.rdsInstance,
  rdsSg: storageStack.rdsSg,
  feEcrRepository: storageStack.feEcrRepository,
  beEcrRepository: storageStack.beEcrRepository,
}

const infraStack = new InfrastructureStack(app, 'infra-stack', { 
  vpc: netStack.vpc,

  // storage props
  ...storageResources,

  env: { account: "597088039155",  region: "us-east-1" }
});

const infrastructureResources: InfraProps = {
  ecsCluster: infraStack.ecsCluster,
  alb: infraStack.alb,
  feTG: infraStack.feTG,
  beTG: infraStack.beTG,
  ecsNs: infraStack.ecsNs
}


const appStack = new AppStack(app, 'app-stack', {
  env: { account: "597088039155",  region: "us-east-1" },
  
  // storage props
  ...storageResources,

  //compute props
  ...infrastructureResources

});

const appResources : AppProps = {
  feService: appStack.feService,
  beService: appStack.beService
}


new CodePipelineStack(app, 'code-pipeline-stack', {
  env: { account: "597088039155",  region: "us-east-1" },

  //storage props
  ...storageResources,

  //infrastructure props
  ...infrastructureResources,

  // app props
  ...appResources
  
});

