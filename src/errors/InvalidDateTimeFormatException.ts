import Exception from "./Exception";


export default class InvalidDateTimeFormatException extends Exception {

  constructor(raw:string,pattern: string) {
    super(`Text '${raw}' count not be parsed by pattern '${pattern}' `)
  }

}