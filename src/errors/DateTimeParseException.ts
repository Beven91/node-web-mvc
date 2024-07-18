import Exception from "./Exception";


export default class DateTimeParseException extends Exception {
  constructor(raw:string, pattern: string, exp: string) {
    super(`Text '${raw}' could not be parsed at exp '${exp}' at pattern '${pattern}'`);
    this.name = this.constructor.name;
  }
}