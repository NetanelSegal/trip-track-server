export class Logger {
  private static colorize(text: string, colorCode: string): string {
    return `\x1b[${colorCode}m${text}\x1b[0m`;
  }

  private static formatMessage(
    message: string | object,
    prefix: string,
    colorCode: string
  ): string {
    const coloredPrefix = this.colorize(prefix, colorCode);
    const formattedMessage =
      typeof message === 'object'
        ? `\n${JSON.stringify(message, null, 2)}`
        : ` ${message}`;
    return `${coloredPrefix}${formattedMessage}`;
  }

  static info(message: string | object): void {
    console.log(this.formatMessage(message, '[INFO]:', '36')); // Cyan
  }

  static error(message: string | object): void {
    console.error(this.formatMessage(message, '[ERROR]:', '31')); // Red
  }

  static warn(message: string | object): void {
    console.warn(this.formatMessage(message, '[WARN]:', '33')); // Yellow
  }

  static success(message: string | object): void {
    console.log(this.formatMessage(message, '[SUCCESS]:', '32')); // Green
  }

  static debug(message: string | object): void {
    console.log(this.formatMessage(message, '[DEBUG]:', '34')); // Blue
  }
}
