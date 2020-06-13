/**
 * @module Api
 * @description swagger的Api注解 用于标注controller接口类
 */
import OpenApi from '../openapi/index';
import { ApiOptions } from '../openapi/declare';

/**
 * 用于标注指定controller为接口类
 * @param {ApiOptions} options 
 */
export default function Api(options: ApiOptions) {
  return (controller) => {
    OpenApi.addApi(options, controller);
  }
}