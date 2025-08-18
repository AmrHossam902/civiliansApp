#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PopulationInfrastructureStack } from '../lib/app-infra-stack';
import { NetworkStack } from '../lib/network-stack';

const app = new cdk.App();
new NetworkStack(app, 'Network-stack');

