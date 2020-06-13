/**
 * @module OpenApiModel
 * @description 用于构建当前环境的openapi.json
 */
import path from 'path';
import RouteCollection from '../../routes/RouteCollection';
import ControllerManagement from '../../ControllerManagement';
import { ApiOptions, ApiOperationOptions, ApiImplicitParamOptions } from './declare';
import { ApiModelOptions, ApiModelPropertyOptions } from './declare';

declare class PathInfo {

}

declare class Paths {
  [propName: string]: PathInfo
}

const documentation = {
  info: {} as any,
  tags: [],
  paths: {} as Paths,
  servers: {} as any,
  components: {},
  openapi: '3.0.1',
};

export default class OpenApiModel {

  /**
   * 初始化swagger文档配置
   */
  static initialize() {
    // 获取当前工程的信息
    const pkg = require(path.resolve('package.json'));
    documentation.info.title = pkg.name;
    documentation.info.version = pkg.version;
    documentation.info.description = pkg.description || '';
    // 初始化server 地址信息
    documentation.servers = [
      { url: RouteCollection.base || '/' }
    ]
  }

  /**
   * 新增api
   * @param { ApiOptions  } api 修饰的接口配置
   * @param { Controller } controller 修饰的控制器
   */
  static addApi(api: ApiOptions, controller) {
    api = (api || {}) as ApiOptions;
    const from = api.tags || [api.value || controller.name];
    const tags = documentation.tags;
    from.forEach((tag) => {
      tag = tag.trim();
      if (!tags.find((t) => t.name === tag)) {
        tags.push({ name: tag });
      }
    })
  }

  /**
   * 添加操作
   * @param { ApiOptions  } operation 修饰的接口方法配置
   * @param { Controller } ctor 修饰的控制器
   * @param { String } name 操作名称
   */
  static addOperation(operation: ApiOperationOptions, ctor, name) {
    const paths = documentation.paths;
    const descriptor = ControllerManagement.getControllerDescriptor(ctor);
    const actions = descriptor.actions;
    Object.keys(actions).forEach((k) => {
      const actionDescriptor = actions[k];
      const mapping = actionDescriptor.mapping;
      mapping.value.forEach((path) => {
        paths[path] = {

        }
      })
    });
  }

  /**
   * 添加操作参数列表
   * @param { ApiOptions  } params 修饰的接口方法的参数配置
   * @param { Controller } controller 修饰的控制器
   * @param { String } name 操作名称
   */
  static addOperationParams(operation: Array<ApiImplicitParamOptions>, controller, name) {

  }

  /**
   * 添加实体类
   * @param { ApiModelOptions } modelOptions 修饰的实体类配置
   * @param { model } 修饰的实体类类
   */
  static addModel(modelOptions: ApiModelOptions, model) {

  }

  /**
   * 添加实体类字段
   * @param { ApiModelOptions } propertyOptions 修饰的实体类属性配置
   * @param { model } 修饰的实体类类
   * @param { Sting } name 修饰的属性名
   */
  static addModelProperty(propertyOptions: ApiModelPropertyOptions, model, name) {

  }
}