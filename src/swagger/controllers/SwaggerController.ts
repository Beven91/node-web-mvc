import fs from 'fs';
import path from 'path';
import RequestMapping from '../../servlets/annotations/mapping/RequestMapping';
import OpenApi from '../openapi/index';
import ServletRequest from '../../servlets/annotations/params/ServletRequest';
import ServletResponse from '../../servlets/annotations/params/ServletResponse';

// 设置常见内容文件返回mime
const producers = {
  '.js': 'text/javascript',
  '.html': 'text/html',
  '.css': 'text/css'
}

export default class SwaggerController {

  /**
   * 用于构建当前环境的所有接口的openapi.json文档结构文件
   */
  @RequestMapping({  value: '/swagger-ui/openapi.json', produces: 'application/json' })
  openapi() {
    return OpenApi.build();
  }
}
