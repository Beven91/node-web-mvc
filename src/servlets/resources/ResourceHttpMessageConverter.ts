/**
 * @module ResourceHttpMessageConverter
 */

import AbstractHttpMessageConverter from "../http/converts/AbstractHttpMessageConverter";
import MediaType from "../http/MediaType";
import ServletContext from "../http/ServletContext";
import Resource from "./Resource";

export default class ResourceHttpMessageConverter extends AbstractHttpMessageConverter {

  constructor() {
    super(MediaType.ALL);
  }

  read(servletContext: ServletContext, mediaType: MediaType) {
    throw new Error("ResourceHttpMessageConverter not support read.");
  }

  write(resource: Resource, mediaType: MediaType, servletContext: ServletContext) {
    return new Promise((resolve) => {
      const stream = resource.getInputStream();
      const start = Date.now();
      stream.pipe(servletContext.response.nativeResponse);
      stream.on('end',()=>{
        console.log(`${resource.filename} cost: ${Date.now() - start}ms`);
      })
      resolve();
    })
  }
}