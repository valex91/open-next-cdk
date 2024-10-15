#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {AppStack} from '../lib/app-stack';

const app = new cdk.App();
new AppStack(app, 'AppStack', {
  env: {
    region: 'eu-west-1',
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
});
