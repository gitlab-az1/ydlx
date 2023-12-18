import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import { Deferred } from 'typesdk/async';
import { Exception } from 'typesdk/errors';
import { Process, ProcessOutput } from 'typesdk/process';

import { ensureDir } from '@resources/fs';
import { spinner, root } from '@utils/index';


export type QualityDescriptor = 'high' | 'medium' | 'low' | `${number}p`;

type Out = {
  path: string;
  filename: string;
}

type Quality = {
  resolution: Omit<QualityDescriptor, 'medium'>;
  fallbackResolution: 'high' | 'low';
}

export class YouTubeDownloader {
  readonly #videoId: string;
  #quality: Quality;

  constructor(video: string) {
    if(video.startsWith('https:') || video.indexOf('youtube.com/') > -1) {
      video = video.split('v=')[1].split('&')[0].trim();
    }

    const id = /^[A-Za-z0-9_-]{11}$/;

    if(!id.test(video)) {
      throw new Exception('Invalid YouTube Video ID');
    }

    this.#videoId = video;
    this.#quality = {
      resolution: '720p',
      fallbackResolution: 'low',
    };

    if(_Arguments.verbose) {
      logger.info(`loaded video https://youtube.com/watch?v=${video}`);
    }
  }

  public get videoId(): string {
    return this.#videoId;
  }

  public get resolution(): string {
    return this.#quality.resolution as unknown as string;
  }

  public quality(q: QualityDescriptor): YouTubeDownloader {
    let fallback: 'high' | 'low' = 'low';

    if(/^[0-9]{3,4}p$/.test(q)) {
      const rn = parseInt(q);
      fallback = rn >= 1080 ? 'high' : 'low';
    }

    if(q === 'medium') {
      q = '720p';
    }

    this.#quality = {
      resolution: q,
      fallbackResolution: fallback,
    };

    if(_Arguments.verbose) {
      logger.info(`set quality to ${q} (fallback: ${fallback})`);
    }

    return this;
  }


  async #DoDownload(outpath?: string): Promise<Out> {
    outpath ??= path.join(os.homedir(), 'Downloads');

    if(outpath) {
      await ensureDir(outpath);
    }

    const pythonBin = await getPythonExecutablePath(true);
    const deferred = new Deferred<Out, Exception>();

    const videoFlag = `--video_id ${this.#videoId}`;
    const resolutionFlag = `--resolution ${this.#quality.resolution.endsWith('p') ? this.#quality.resolution : this.#quality.resolution + 'est'}`;
    const fallbackResolutionFlag = `--resolution-fallback ${this.#quality.fallbackResolution}est`;

    const parts = [
      pythonBin,
      videoFlag,
      resolutionFlag,
      fallbackResolutionFlag,
    ];

    if(outpath) {
      parts.push(`--out ${outpath}`);
    }

    const proc = new Process(parts, undefined, { shell: true });      
    proc.stdio('inherit', 'pipe', 'pipe');
      
    const onCompleted = (result: ProcessOutput) => {
      if(result.stdout.startsWith('[done]')) return deferred.resolve(extractPathAndFilename(result.stdout)!);
      if(result.stdout.includes('(error)')) return deferred.reject(new Exception(result.stdout.split('(error)')[1].trim()));
      if(result.stderr.includes('(error)')) return deferred.reject(new Exception(result.stderr.split('(error)')[1].trim()));

      deferred.reject(new Exception('Unknown error'));
    };

    const onRejected = (result: ProcessOutput) => {
      logger.warn(result.stdout);
      logger.warn(result.stderr);

      deferred.reject(new Exception(result.stderr));
    };

    try {
      const out = _Arguments.verbose ? 
        await spinner('Downloading video...', () => proc.run()) :
        await proc.run();

      if(_Arguments.verbose) {
        logger.info('Download completed\n');
      }

      onCompleted(out);
    } catch (err: any) {
      onRejected(err as ProcessOutput);
    }
    
    return deferred.promise;
  }

  public download(outpath?: string): Promise<Out> {
    return this.#DoDownload(outpath);
  }


  async #DoAudioExtraction(outpath?: string): Promise<Out> {
    const download = await this.download(outpath);

    if(outpath) {
      download.path = outpath;
    } else {
      download.path = path.join(os.homedir(), 'Downloads');
    }

    const videoPath = path.join(download.path, download.filename);
    
    let cmd = 'ffmpeg -i ';
    cmd += `${path.join(download.path, download.filename)} `;
    cmd += '-vn -acodec libmp3lame -ac 2 -ab 160k -ar 48000 ';

    download.filename = download.filename.replace('.mp4', '.mp3');

    cmd += path.join(download.path, download.filename);

    const proc = new Process(cmd, undefined, { shell: true });
    const deferred = new Deferred<Out, Exception>();

    try {
      const out = _Arguments.verbose ? 
        await spinner('Extracting audio...', () => proc.run()) :
        await proc.run();

      if(_Arguments.verbose) {
        logger.info('Audio extraction completed\n');
      }

      if(out.stdout.includes('error')) {
        deferred.reject(new Exception(out.stdout));
      }else {
        await fs.promises.unlink(videoPath);
        deferred.resolve(download);
      }
    } catch (err: any) {
      deferred.reject(new Exception(err.stderr));
    }

    return deferred.promise;
  }

  public async extractAudio(outpath?: string): Promise<Out> {
    return this.#DoAudioExtraction(outpath);
  }
}

function extractPathAndFilename(input: string): { path: string, filename: string } | null {
  // eslint-disable-next-line no-useless-escape
  const regex = /\[done\] \(success\) Downloaded video `([^`]+)` to `(.+)\/((?:[^\/]+\/)*)([^\/]+)/;
  const match = input.match(regex);

  if(!match) return null;

  const videoId = match[1];
  const path = match[2];
  return { path, filename: `${videoId}.mp4` };
}


async function getPythonExecutablePath(venv: boolean = false): Promise<string> {
  let res = venv ? 
    path.join(root, '.script', '.venv', 'bin', 'python3') + ' '
    : 'python3 ';

  res += path.join(root, '.script', 'ydl.py');
  return res;
}