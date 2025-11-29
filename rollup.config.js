/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import summary from 'rollup-plugin-summary';
import { terser } from 'rollup-plugin-terser';

const disableTerser = process.env.HEXCHESS_DISABLE_TERSER === 'true';
const workerOverride = Number(process.env.TERSER_NUM_WORKERS ?? '');
const terserOptions = {
  ecma: 2021,
  module: true,
  warnings: true,
  mangle: {
    properties: {
      regex: /^__/,
    },
  },
};

if (!Number.isNaN(workerOverride) && workerOverride > 0) {
  terserOptions.numWorkers = workerOverride;
}

const plugins = [replace({ 'Reflect.decorate': 'undefined' }), resolve()];

if (!disableTerser) {
  /**
   * This minification setup serves the static site generation.
   * For bundling and minification, check the README.md file.
   */
  plugins.push(terser(terserOptions));
}

plugins.push(summary());

export default {
  input: 'hexchess-board.js',
  output: {
    file: 'hexchess-board.bundled.js',
    format: 'esm',
  },
  onwarn(warning) {
    if (warning.code !== 'THIS_IS_UNDEFINED') {
      console.error(`(!) ${warning.message}`);
    }
  },
  plugins,
};
