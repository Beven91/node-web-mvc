import Exception from './Exception';

export default class IllegalMappingPatternError extends Exception {
  constructor(pattern: string) {
    super();
    const indicator = '^';
    const count = pattern.indexOf('**');
    const empty = [];
    for (let i=0; i<count; i++) {
      empty.push(' ');
    }
    this.message = `\n\nInvalid mapping pattern detected:\n${pattern}\n${empty.join('')}${indicator}\nNo more pattern data allowed after {*...} or ** pattern element\n\n`;
  }
}
