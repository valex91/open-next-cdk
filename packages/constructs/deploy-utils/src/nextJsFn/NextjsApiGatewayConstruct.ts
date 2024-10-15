import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';

import type {IFunction} from 'aws-cdk-lib/aws-lambda';
import type {IBucket} from 'aws-cdk-lib/aws-s3';
import type {Construct} from 'constructs';
import {RestApi, RestApiProps} from 'aws-cdk-lib/aws-apigateway';

export interface NextjsApiGatewayProps extends RestApiProps {
  bucket: IBucket;
  serverFunction: IFunction;
}

export class NextjsApiGateway extends RestApi {
  public readonly bucket: IBucket;

  public readonly executeRole: iam.Role;

  public readonly serverFunction: IFunction;

  constructor(scope: Construct, id: string, props: NextjsApiGatewayProps) {
    const superProps = {...props, binaryMediaTypes: ['*/*']};
    super(scope, id, superProps);
    this.bucket = props.bucket;
    this.serverFunction = props.serverFunction;
    // create a role api gateway can use to talk to the s3 bucket
    this.executeRole = new iam.Role(this, 'BucketExecuteRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    });
    this.bucket.grantReadWrite(this.executeRole);
    this.addBucketProxyIntegration('_next');
    this.addBucketProxyIntegration('assets');
    this.addServerFunctionIntegration();
  }

  getS3Integration = (pathpath: string) =>
    new apigw.AwsIntegration({
      service: 's3',
      path: `${this.bucket.bucketName}/${pathpath}/{proxy}`,
      integrationHttpMethod: 'GET',
      options: {
        credentialsRole: this.executeRole,
        requestParameters: {
          'integration.request.path.proxy': 'method.request.path.proxy',
        },
        passthroughBehavior: apigw.PassthroughBehavior.WHEN_NO_MATCH,
        integrationResponses: [
          {
            statusCode: '200',
            selectionPattern: '.*',
            responseParameters: {
              'method.response.header.Content-Type':
                'integration.response.header.Content-Type',
            },
          },
        ],
      },
    });

  addBucketProxyIntegration = (pathPart: string) => {
    this.root.addResource(pathPart).addProxy({
      anyMethod: true,
      defaultIntegration: this.getS3Integration(pathPart),
      defaultMethodOptions: {
        requestParameters: {'method.request.path.proxy': true},
        methodResponses: [
          {
            statusCode: '200',
            responseParameters: {'method.response.header.Content-Type': true},
          },
        ],
      },
    });
  };

  addServerFunctionIntegration = () => {
    const lambdaIntegration = new apigw.LambdaIntegration(this.serverFunction, {
      proxy: true,
    });

    this.root.addMethod('ANY', lambdaIntegration);
    this.root.addProxy({
      defaultIntegration: lambdaIntegration,
    });
  };
}
