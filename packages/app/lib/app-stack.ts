import {Backend} from 'backend';
import {UI} from 'ui';
import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new Backend(this, 'server');
    new UI(this, 'UI');
  }
}
