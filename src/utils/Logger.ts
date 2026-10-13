/**
 * Logger — simple tagged console logger.
 * Every Page Object and Manager uses this instead of raw console.log
 * so output is uniform and easy to grep in CI logs.
 */
export class Logger {
  constructor(private readonly tag: string) {}

  info(message: string):  void { console.log  (`[INFO]  [${this.tag}] ${message}`); }
  warn(message: string):  void { console.warn (`[WARN]  [${this.tag}] ${message}`); }
  error(message: string): void { console.error(`[ERROR] [${this.tag}] ${message}`); }
  debug(message: string): void {
    if (process.env.DEBUG === 'true') {
      console.log(`[DEBUG] [${this.tag}] ${message}`);
    }
  }
}
