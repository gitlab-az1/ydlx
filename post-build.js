// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('node:path');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('node:fs');

const buildDir = path.resolve(process.cwd(), 'dist');
const srcDir = path.resolve(process.cwd(), 'src');


const appVersionScript = `"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.version = exports.default = void 0;
const version = exports.version = '$ver';
var _default = exports.default = version;`;

async function recursiveRemoveDirectoryFiles(dir) {
  if(!fs.existsSync(dir)) return;

  for(const filename of (await fs.promises.readdir(dir))) {
    const stats = await fs.promises.stat(path.join(dir, filename));

    if(stats.isDirectory()) {
      await recursiveRemoveDirectoryFiles(path.join(dir, filename));
    } else {
      await fs.promises.unlink(path.join(dir, filename));
    }
  }

  await fs.promises.rmdir(dir);
}


async function recursiveRemoveUnnecessaryFiles(dir) {
  if(!fs.existsSync(dir)) return;

  for(const filename of (await fs.promises.readdir(dir))) {
    const stats = await fs.promises.stat(path.join(dir, filename));
    
    if(stats.isDirectory()) {
      await recursiveRemoveUnnecessaryFiles(path.join(dir, filename));
    } else if(
      /.spec./.test(filename) /* ||
      filename === '_types.js'*/ ||
      filename.endsWith('.tmp') ||
      filename.indexOf('.d.js') > -1
    ) {
      await fs.promises.unlink(path.join(dir, filename));
    }
  }
}


async function main() {
//   await recursiveRemoveDirectoryFiles(path.join(buildDir, 'types'));
  await recursiveRemoveUnnecessaryFiles(buildDir);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkg = require('./package.build.json');
  await fs.promises.writeFile(path.join(buildDir, 'utils', '_appversion.js'),
    appVersionScript.replace('$ver', pkg.version),
    { encoding: 'utf-8' });

  await fs.promises.rename(
    path.join(buildDir, 'bin', 'main.js'),
    path.join(buildDir, 'bin', 'main'),
  );

  await fs.promises.chmod(path.join(buildDir, 'bin', 'main'), 0o755);
}

main().catch(console.error);