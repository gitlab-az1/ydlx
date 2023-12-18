declare interface Logger {
  info(message: any): void;
  success(message: any): void;
  warn(message: any): void;
  error(message: any): void;
  debug(message: any): void;
  trace(message: any): void;
  fatal(message: any): void;
}


declare function panic(__message: string, __exitCode: NodeJS.Signals | number): never;
declare const logger: Logger;