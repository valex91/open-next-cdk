import path from 'path';

import {CfnOutput} from 'aws-cdk-lib';

import type {Construct} from 'constructs';

import {DOMAIN_NAME, Nextjs} from 'deploy-utils';

export class UI extends Nextjs {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      nextjsPath: path.join(__dirname, '..'),
      nextjsPathFromMonorepoRoot: 'packages/constructs/ui',
      lambda: {
        environment: {},
      },
    });

    new CfnOutput(this, 'Url', {
      description: 'public URL',
      value: `https://${DOMAIN_NAME}`,
    }).overrideLogicalId('AppUrl');
  }
}
