/**
 * @module ResourceResolver
 * @description 解析静态资源路径
 */

import path from 'path';
import fs from 'fs';
import HttpServletRequest from "../http/HttpServletRequest";
import Resource from "./Resource";
import ResourceHandlerRegistration from "./ResourceHandlerRegistration";

export default class ResourceResolver {

  private registration: ResourceHandlerRegistration

  constructor(registration: ResourceHandlerRegistration) {
    this.registration = registration;
  }

  resolve(request: HttpServletRequest): Resource {
    const name = request.usePath;
    const resourceLocations = this.registration.resourceLocations || [];
    const location = resourceLocations.find((root) => {
      const file = path.join(root, name);
      return fs.existsSync(file);
    });
    return location ? new Resource(path.join(location, name)) : null;
  }
}