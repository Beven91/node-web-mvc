/**
 * @module HttpMessageConverter
 * @description 请求消息转换工具
 */

import ServletContext from "../ServletContext";
import MediaType from "../MediaType";

export default interface HttpMessageConverter {
  /**
   * 判断当前转换器是否能处理当前内容类型
   * @param mediaType 当前内容类型 例如: application/json
   */
  canRead(mediaType: MediaType): boolean

  /**
   * 判断当前内容是否能写
   * @param mediaType 当前内容类型 例如: application/json 
   */
  canWrite(mediaType: MediaType): boolean

  // getSupportedMediaTypes(): Array<string>

  /**
   * 读取当前消息内容
   * @param servletRequest 
   */
  read(servletContext: ServletContext, mediaType: MediaType): any;

  /**
   * 写出当前内容
   * @param data 当前数据
   * @param mediaType 当前内容类型
   * @param servletContext 当前请求上下文
   */
  write(data: any, mediaType: MediaType, servletContext: ServletContext): Promise<any>
}