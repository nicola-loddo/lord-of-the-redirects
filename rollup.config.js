import nodeResolve from "@rollup/plugin-node-resolve";
import { fileURLToPath } from 'node:url'
import del from 'rollup-plugin-delete'
import copy from 'rollup-plugin-copy'
import { dirname, resolve } from 'node:path'
import watchAssets from 'rollup-plugin-watch-assets';




const __dirname = dirname(fileURLToPath(import.meta.url))
export default [
  {
    input: {
      background: resolve(__dirname, 'src/background.js'),
    },
    output: {
      dir: resolve(__dirname, 'extension/build/background/'),
      format: 'es',
    },
    plugins: [
      nodeResolve({
        browser: true,
      }),
      del({ targets: resolve(__dirname, 'extension/build/background/*') }),
    ],
  },
  {
    input: {
      options: resolve(__dirname, 'src/options/js/options.js'),
    },
    output: {
      dir: resolve(__dirname, 'extension/build/options/js/'),
      format: 'es',
    },
    plugins: [
      nodeResolve({
        browser: true,
      }),
      del({ targets: resolve(__dirname, 'extension/build/options/*') }),
      copy({
        targets: [
          { src: 'src/options/options.html', dest: 'extension/build/options' },
          { src: 'src/options/css/options.css', dest: 'extension/build/options/css' },
        ]
      }),
      watchAssets({ assets: ['src/options/options.html', 'src/options/css/*.css'] })
    ],
  },
  {
    input: {
      popup: resolve(__dirname, 'src/popup/js/popup.js'),
    },
    output: {
      dir: resolve(__dirname, 'extension/build/popup/js/'),
      format: 'es',
    },
    plugins: [
      nodeResolve({
        browser: true,
      }),
      del({ targets: resolve(__dirname, 'extension/build/popup/*') }),
      copy({
        targets: [
          { src: 'src/popup/popup.html', dest: 'extension/build/popup' },
          { src: 'src/popup/css/popup.css', dest: 'extension/build/popup/css' },
        ]
      }),
      watchAssets({ assets: ['src/popup/popup.html', 'src/popup/css/*.css'] })
    ],
  },
];