import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import type {OpenNextJSBuild} from './openNextJsBuild';
import type {IFunction} from 'aws-cdk-lib/aws-lambda';
import type * as s3 from 'aws-cdk-lib/aws-s3';
import type {Construct} from 'constructs';

const defaultLambdaProps = {
  timeout: cdk.Duration.seconds(30),
  memorySize: 512,
  runtime: lambda.Runtime.NODEJS_20_X,
};

export interface NextjsServerFunctionProps
  extends Omit<lambda.FunctionProps, 'code' | 'runtime'> {
  nextBuild: OpenNextJSBuild;
  staticAssetBucket: s3.IBucket;
  envValues: Record<string, string>;
}

export class NextjsServerFunction extends lambda.Function {
  lambdaFunctionAlias: IFunction;

  constructor(scope: Construct, id: string, props: NextjsServerFunctionProps) {
    let superProps: lambda.FunctionProps = {
      ...defaultLambdaProps,
      ...props,
      code: lambda.Code.fromAsset(props.nextBuild.serverFnDir),
      environment: {...props.envValues},
    };

    super(scope, id, superProps);

    this.lambdaFunctionAlias = this.addAlias('live');
    props.staticAssetBucket.grantReadWrite(this);
  }
}
