declare interface Logger {
  info(message: any): void;
  success(message: any): void;
  warn(message: any): void;
  error(message: any): void;
  debug(message: any): void;
  trace(message: any): void;
  fatal(message: any): void;
}

declare interface ParsedArgs {
  [arg: string]: any;

  /**
   * If opts['--'] is true, populated with everything after the --
   */
  '--'?: string[] | undefined;

  /**
   * Contains all the arguments that didn't have an option associated with them
   */
  _: string[];
}


declare function panic(__message: string, __exitCode: NodeJS.Signals | number): Promise<never>;
declare const _Arguments: ParsedArgs;
declare const _InstanceID: string;
declare const logger: Logger;