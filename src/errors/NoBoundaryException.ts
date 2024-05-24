import Exception from "./Exception";

export default class NoBoundaryException extends Exception {

  constructor() {
    super('mutiple-data boundary not preset');
  }

}