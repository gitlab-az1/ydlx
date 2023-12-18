#!/usr/bin/env node

'use strict';
process.env.NODE_ENV = 'production';
Object.assign(global, {
  _InstanceID: _GetRandomID(),
});

function _GetRandomID(): string {
  const _ = () => ((Math.random() * 1000000) | 0).toString(16).padStart(6, '0');
  let id: string = _();

  for(let i = 0; i < 4; i++) {
    id += _();
  }

  return _StringShuffle(id);
}

function _StringShuffle(str: string): string {
  const arr = str.split('');

  // Loop through the array
  for (let i = arr.length - 1; i > 0; i--) {
    // Generate a random index
    const j = Math.floor(Math.random() * (i + 1));

    // Swap the current element with the random element
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }

  // Convert the array back to a string and return it
  return arr.join('');
}

import { __$exec } from '../cli';

const args = process.argv.slice(2);
__$exec(args.length, args);
