import { format } from 'typesdk/utils/asci';
import { createLogger } from 'typesdk/logger';
import { isProduction } from 'typesdk/constants';

import load_minimist from '@resources/minimist.module';


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


const logger = createLogger();

function panic(message: string, __exitCode: NodeJS.Signals | number): never {
  const code = typeof __exitCode === 'string' ? `${format.colors.brightYellow}${__exitCode}${format.reset}` : __exitCode;

  console.log(`\n${format.bold}${format.colors.red}PANIC:${format.reset} ${format.colors.brightYellow}${message}${format.reset}`);
  console.log(`${format.bold}${format.colors.red}Fatal:${format.reset}${format.reset} process failed with exit code ${code}`);

  if(isProduction) {
    logger.fatal(message);
  }

  return process.exit(0);
}

Object.assign(global, { panic, logger });


export async function __$exec(argc: number, argv: string[]): Promise<unknown> {
  const args = load_minimist(argv, {
    alias: {
      h: 'help',
      o: 'output',
      v: 'version',
    },
  });

  return logger.trace({ argc, argv, args });
}