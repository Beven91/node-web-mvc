export default class Colors {
  static red(message: string) {
    return `\x1b[31m${message}\x1b[39m`;
  }

  static gray(message: string) {
    return `\x1b[90m${message}\x1b[39m`;
  }
  static yellow(message: string) {
    return `\x1b[33m${message}\x1b[39m`;
  }

  static blue(message: string) {
    return `\x1b[34m${message}\x1b[39m`;
  }

  static lightBlue(message: string) {
    return `\x1b[36m${message}\x1b[39m`;
  }
}
