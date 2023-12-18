import fs from 'node:fs';
import { FOLDER_PERMISSION } from 'typesdk/constants';


export async function ensureDir(dirname: string): Promise<string | undefined> {
  if(!fs.existsSync(dirname)) return fs.promises.mkdir(dirname, {
    recursive: true,
    mode: FOLDER_PERMISSION,
  });

  const stat = await fs.promises.stat(dirname);
  if(!stat.isDirectory()) return panic(`cannot create directory '${dirname}': file exists and is not a directory`, 20);

  return dirname;
}
