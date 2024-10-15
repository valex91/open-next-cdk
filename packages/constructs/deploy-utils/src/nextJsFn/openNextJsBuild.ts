import fs from 'fs';
import path from 'path';

import {Construct} from 'constructs';

import {
  NEXTJS_BUILD_DIR,
  NEXTJS_BUILD_SERVER_FN_DIR,
  NEXTJS_STATIC_DIR,
} from './constants';

export type OpenNextJSBuildProps = {
  nextjsPath: string;
};

export class OpenNextJSBuild extends Construct {
  private nextjsPath: string;

  readonly buildDir: string;

  readonly staticDir: string;

  readonly serverFnDir: string;

  constructor(scope: Construct, id: string, props: OpenNextJSBuildProps) {
    super(scope, id);

    this.nextjsPath = props.nextjsPath;
    this.buildDir = this.getDir(
      path.resolve(this.nextjsPath, NEXTJS_BUILD_DIR)
    );
    this.staticDir = this.getDir(path.join(this.buildDir, NEXTJS_STATIC_DIR));
    this.serverFnDir = this.getDir(
      path.join(this.buildDir, NEXTJS_BUILD_SERVER_FN_DIR)
    );
    console.log(this.serverFnDir, '- serverFnDir');
    console.log(this.staticDir, '- staticDir');
    console.log(this.buildDir, '- staticDir');
  }

  private getDir(dir: string): string {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (!fs.existsSync(dir)) {
      throw new Error(`Build Error: ${dir} does not exist.`);
    }

    return dir;
  }
}
