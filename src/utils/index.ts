import { format } from 'typesdk/utils/asci';

import version from './_appversion';
export { version } from './_appversion';


export function printUsage(): void {
  let msg = `${format.bold}YDLX${format.reset} - ${format.colors.brightYellow}Youtube Downloader${format.reset} v${version}\n`;

  msg += `\n${format.bold}Usage:${format.reset}`;
  msg += '  ydlx <video> [options]\n\n';

  msg += `${format.bold}Options:${format.reset}\n`;
  msg += '  -q, --quality   Sets the video quality. You can use a predefined quality like "high" or "low", or you can use a custom quality like "720p"\n';
  msg += '  -h, --help      Show this help message and exit\n';
  msg += '  -v, --version   Show version number and exit\n';
  msg += '  -o, --output    Sets the output directory\n';
  msg += '  --audio-only    Downloads only the audio track\n';
  msg += '  --set-name      Sets the output filename to the video title\n';

  console.log(msg);
}


export async function spinner<T>(
  title: string | (() => T),
  callback?: () => T,
): Promise<T> {
  if(typeof title == 'function') {
    callback = title;
    title = '';
  }

  let i = 0;
  const spin = () => process.stderr.write(`  ${'⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'[i++ % 10]} ${title}\r`);
  const id = setInterval(spin, 100);
  let result: T;

  try {
    result = await callback!();
  } finally {
    clearInterval(id);
    process.stderr.write(' '.repeat(process.stdout.columns - 1) + '\r');
  }

  return result;
}