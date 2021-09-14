/**
 * @module HttpRange
 */

import HttpHeaders from "./HttpHeaders";
import HttpServletRequest from "./HttpServletRequest";

export default class HttpRange {

  public readonly unit: string

  public readonly start: number

  public readonly end: number

  constructor(unit: string, start, end) {
    this.unit = unit;
    this.start = Number(start);
    this.end = end === '' ? -1 : Number(end);
  }

  static getRanges(request: HttpServletRequest) {
    const range = request.getHeader(HttpHeaders.RANGE);
    if (!range) {
      return null;
    }
    const segments = range.toString().split('=');
    const unit = segments.shift();
    const ranges = segments.pop().split(',');
    return ranges.map((range) => {
      const numbers = range.split('-');
      return new HttpRange(unit, numbers[0], numbers[1]);
    });
  }
}