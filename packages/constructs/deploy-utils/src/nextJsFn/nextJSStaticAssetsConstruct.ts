import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

import type { OpenNextJSBuild } from "./openNextJsBuild";
import type * as s3 from "aws-cdk-lib/aws-s3";

export type OpenNextStaticAssetsProps = {
  /**
   * The `NextjsBuild` instance representing the built Nextjs application.
   */
  nextBuild: OpenNextJSBuild;
  bucket: s3.IBucket;
};

export class OpenNextStaticAssets extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: OpenNextStaticAssetsProps
  ) {
    super(scope, id);

    new s3deploy.BucketDeployment(this, "BucketDeployment", {
      sources: [s3deploy.Source.asset(props.nextBuild.staticDir)],
      destinationBucket: props.bucket,
      prune: true,
    });
  }
}
