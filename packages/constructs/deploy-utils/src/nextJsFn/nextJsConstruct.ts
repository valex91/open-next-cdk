// import * as cdk from 'aws-cdk-lib';
import {Bucket, BucketEncryption} from 'aws-cdk-lib/aws-s3';
import {Construct} from 'constructs';

import type {FunctionOptions} from 'aws-cdk-lib/aws-lambda';

import {NextjsApiGateway} from './NextjsApiGatewayConstruct';
import {NextjsServerFunction} from './nextJsServerFunction';
import {OpenNextJSBuild} from './openNextJsBuild';
import {OpenNextStaticAssets} from './nextJSStaticAssetsConstruct';
import {DOMAIN_NAME} from './constants';
import {EndpointType, SecurityPolicy} from 'aws-cdk-lib/aws-apigateway';
import {StringParameter} from 'aws-cdk-lib/aws-ssm';
import {NextjsWarmer} from './NextJsWarmer';

export type NextjsProps = {
  nextjsPath: string;
  nextjsPathFromMonorepoRoot?: string;
  lambda: FunctionOptions;
};

export class Nextjs extends Construct {
  serverFunction: NextjsServerFunction;
  restApi: NextjsApiGateway;

  constructor(scope: Construct, id: string, props: NextjsProps) {
    super(scope, id);

    const bucket = new Bucket(this, 'Bucket', {
      encryption: BucketEncryption.S3_MANAGED,
    });

    const nextBuild = new OpenNextJSBuild(this, 'NextjsBuild', {
      nextjsPath: props.nextjsPath,
    });

    new OpenNextStaticAssets(this, 'NextjsStaticAssets', {
      nextBuild,
      bucket,
    });

    const AUTH_GOOGLE_ID = StringParameter.fromStringParameterAttributes(
      this,
      'googleId',
      {
        parameterName: '/FetchFrom/SSM',
      }
    ).stringValue;

    const AUTH_GOOGLE_SECRET = StringParameter.fromStringParameterAttributes(
      this,
      'googleSecret',
      {
        parameterName: '/FetchFrom/SSM',
      }
    ).stringValue;

    const NEXTAUTH_SECRET = StringParameter.fromStringParameterAttributes(
      this,
      'authSecret',
      {
        parameterName: '/FetchFrom/SSM',
      }
    ).stringValue;

    const NEXT_AUTH_URL = `https://${DOMAIN_NAME}`;

    this.serverFunction = new NextjsServerFunction(
      this,
      'NextjsServerFunction',
      {
        nextBuild,
        staticAssetBucket: bucket,
        envValues: {
          AUTH_GOOGLE_ID,
          AUTH_GOOGLE_SECRET,
          NEXTAUTH_SECRET,
          NEXT_AUTH_URL,
        },
        ...(props.nextjsPathFromMonorepoRoot
          ? {
              handler: `${props.nextjsPathFromMonorepoRoot}/index.handler`,
            }
          : {handler: 'index.handler'}),
        ...props.lambda,
      }
    );

    // Optional: Add domain & certificates out of your AWS account

    // const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
    //   domainName: DOMAIN_NAME,
    // });

    // const certificate = new DnsValidatedCertificate(this, 'certificate', {
    //   domainName: DOMAIN_NAME,
    //   hostedZone,
    //   region: 'eu-west-1',
    //   subjectAlternativeNames: ['*.eventm8.live'],
    // });

    this.restApi = new NextjsApiGateway(this, 'NextjsApi', {
      bucket,
      serverFunction: this.serverFunction.lambdaFunctionAlias,
      restApiName: `snap App endpoint`,
      // domainName: {
      //   domainName: DOMAIN_NAME,
      //   certificate,
      //   securityPolicy: SecurityPolicy.TLS_1_2,
      // },
      endpointConfiguration: {types: [EndpointType.REGIONAL]},
      binaryMediaTypes: ['*/*'],
      minimumCompressionSize: 0,
    });

    new NextjsWarmer(this, 'NextjsWarmer', {
      nextBuild,
      restApi: this.restApi,
    });

    // new ARecord(this, 'apiDNS', {
    //   zone: hostedZone,
    //   recordName: DOMAIN_NAME,
    //   target: RecordTarget.fromAlias(new ApiGateway(this.restApi)),
    // });

    // new CnameRecord(this, 'CnameRecord', {
    //   zone: hostedZone,
    //   recordName: 'www',
    //   domainName: DOMAIN_NAME,
    // });
  }
}
