import { zip } from 'zip-a-folder';
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import fs from 'fs'



const __dirname = dirname(fileURLToPath(import.meta.url))

var distFolder = resolve(__dirname, 'dist');

if (!fs.existsSync(distFolder)) {
  fs.mkdirSync(distFolder);
}

await zip(resolve(__dirname, 'extension'), resolve(__dirname, 'dist/extension.zip'));
