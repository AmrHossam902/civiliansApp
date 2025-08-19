#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack-l2';
import { InfrastructureStack } from '../lib/infra-stack';
import { StorageStack } from '../lib/storage-stack';

const app = new cdk.App();
const netStack = new NetworkStack(app, 'Network-stack', {
  env: { account: "597088039155",  region: "us-east-1" }
});
new StorageStack(app, 'storage-stack', { 
  vpc: netStack.vpc,
  env: { account: "597088039155",  region: "us-east-1" }
});
new InfrastructureStack(app, 'infra-stack', { 
  vpc: netStack.vpc,
  env: { account: "597088039155",  region: "us-east-1" }
});

