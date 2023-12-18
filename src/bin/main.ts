#!/usr/bin/env node

'use strict';
process.env.NODE_ENV = 'production';

import { __$exec } from '../cli';

const args = process.argv.slice(2);
__$exec(args.length, args);
