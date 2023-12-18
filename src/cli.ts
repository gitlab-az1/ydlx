import fs from 'node:fs';
import path from 'node:path';
import { format } from 'typesdk/utils/asci';
import { createLogger } from 'typesdk/logger';

import { ensureDir } from '@resources/fs';
import load_minimist from '@resources/minimist.module';
import { YouTubeDownloader } from '@resources/downloader';
import { printUsage, version, spinner, root } from '@utils/index';


process.on('SIGINT', () => {
  panic('process interrupted by user', 'SIGINT');
});

process.on('SIGTSTP', () => {
  panic('process interrupted by user', 'SIGTSTP');
});

process.on('unhandledRejection', reason => {
  panic(`unhandled promise rejection: ${reason} at ${typeof reason === 'object' ? (reason as any).stack : 'undefined'}`, 1);
});

process.on('uncaughtException', err => {
  panic(`uncaught exception: ${err} at ${err.stack}`, 1);
});


const logger = createLogger({ hideDate: true });

async function panic(message: string, __exitCode: NodeJS.Signals | number): Promise<never> {
  const code = typeof __exitCode === 'string' ? `${format.colors.brightYellow}${__exitCode}${format.reset}` : __exitCode;

  console.log(`\n${format.bold}${format.colors.red}PANIC:${format.reset} ${format.colors.brightYellow}${message}${format.reset}`);
  console.log(`${format.bold}${format.colors.red}Fatal:${format.reset}${format.reset} process failed with exit code ${code}`);

  try {
    const logsPath = path.join(root, 'logs');
    await ensureDir(logsPath);

    const logFile = path.join(logsPath, `${_InstanceID}.log`);
    let log = '';

    if(fs.existsSync(logFile)) {
      log = (await fs.promises.readFile(logFile, { encoding: 'utf-8' })).trim();
    }

    log += `${new Date().toISOString()} [fatal] (failed with exit code ${__exitCode}) ${message}\n`;
    await fs.promises.writeFile(logFile, log, { encoding: 'utf-8' });
  } catch (err: any) {
    console.error(err);
  }

  return process.exit(0);
}

Object.assign(global, { panic, logger });

if(typeof _Prod !== 'boolean') {
  Object.assign(global, { _Prod: false });
}


export async function __$exec(_: number, argv: string[]): Promise<unknown> {
  const args = load_minimist(argv, {
    alias: {
      h: 'help',
      o: 'output',
      v: 'version',
      q: 'quality',
    },
  });

  Object.assign(global, { _Arguments: args });
  console.clear();

  if(args.help) {
    printUsage();
    return process.exit(0);
  }

  if(args.version) {
    console.log(`${format.bold}YDLX${format.reset} - ${format.colors.brightYellow}Youtube Downloader${format.reset} v${version}`);
    return process.exit(0);
  }

  const [video] = args._;
  if(!video) return panic('no video url provided', 1);

  
  try {
    const downloader = new YouTubeDownloader(video);

    if(args.quality) {
      downloader.quality(args.quality);
    }

    const outputPath = typeof args.output === 'string' ? args.output : undefined;

    const output = args['audio-only'] ?
      await downloader.extractAudio(outputPath) : 
      await downloader.download(outputPath);

    let outputFilename = output.filename;

    if(args['set-name'] && typeof args['set-name'] === 'string' && args['set-name'].trim().length > 0) {
      const hasExt = /\.[a-z0-9]{3,4}$/.test(args['set-name']);
      outputFilename = hasExt ? args['set-name'] : `${args['set-name']}.${args['audio-only'] ? 'mp3' : 'mp4'}`;

      const _renamePromise = () => fs.promises.rename(
        path.join(output.path, output.filename),
        path.join(output.path, outputFilename) // eslint-disable-line comma-dangle
      );

      if(args.verbose) {
        await spinner(`renaming file to ${format.colors.brightYellow}${args['set-name']}${format.reset}`, _renamePromise);
        logger.info(`renamed file to ${format.colors.brightYellow}${args['set-name']}${format.reset}`);
      } else {
        await _renamePromise();
      }
    }

    logger.success(`downloaded ${format.colors.brightYellow}${outputFilename}${format.reset} to ${format.colors.brightYellow}${output.path}${format.reset}`);    
    return process.exit(0);
  } catch (err: any) {
    return panic(err.message, 1);
  }
}