/**
 * @module ResourceRegion
 */

import HttpRange from "../http/HttpRange";
import HttpServletRequest from "../http/HttpServletRequest";
import Resource from "./Resource";

export default class ResourceRegion {

  // 所属资源文件
  readonly resource: Resource

  // 开始位置
  readonly position: number

  // 截取的内容长度
  readonly count: number

  // 结束位置
  get end() {
    const end = this.position + this.count - 1;
    return Math.min(end, this.resource.contentLength - 1);
  }

  constructor(resource: Resource, position: number, count: number) {
    this.resource = resource;
    this.position = position;
    this.count = count;
  }

  static getRangeRegions(request: HttpServletRequest, resource: Resource) {
    return this.toResourceRegions(HttpRange.getRanges(request), resource);
  }

  static toResourceRegions(ranges: Array<HttpRange>, resource: Resource) {
    return ranges.map((range) => {
      const count = range.end - range.start + 1;
      return new ResourceRegion(resource, range.start, count);
    })
  }
}