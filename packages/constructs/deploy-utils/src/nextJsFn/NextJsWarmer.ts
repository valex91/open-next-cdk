import path from 'path';

import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cr from 'aws-cdk-lib/custom-resources';
import {Construct} from 'constructs';

import './warmerHandler';
import type * as apig from 'aws-cdk-lib/aws-apigateway';

import {OpenNextJSBuild} from './openNextJsBuild';
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';

export interface NextjsWarmerProps {
  nextBuild: OpenNextJSBuild;
  restApi: apig.RestApi;
}

export class NextjsWarmer extends Construct {
  constructor(scope: Construct, id: string, props: NextjsWarmerProps) {
    super(scope, id);
    const warmer = new NodejsFunction(this, 'WarmerFunction', {
      entry: path.join(__dirname, './warmerHandler.js'),
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      timeout: cdk.Duration.minutes(15),
      environment: {
        API_URL: props.restApi.url,
        CONCURRENCY: '1',
      },
    });

    new events.Rule(this, 'WarmerRule', {
      schedule: events.Schedule.rate(cdk.Duration.minutes(5)), // or any amount
      targets: [new targets.LambdaFunction(warmer, {retryAttempts: 0})],
    });

    const action = {
      service: 'Lambda',
      action: 'invoke',
      parameters: {
        FunctionName: warmer.functionName,
      },
      physicalResourceId: cr.PhysicalResourceId.of('warmer'),
    };
    const resource = new cr.AwsCustomResource(this, 'Prewarmer', {
      onCreate: action,
      onUpdate: action,
      resourceType: 'Custom::FunctionInvoker',
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['lambda:InvokeFunction'],
          resources: [warmer.functionArn],
        }),
      ]),
    });
    warmer.grantInvoke(resource);
    resource.node.addDependency(props.restApi);
  }
}
