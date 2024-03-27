/**
 * @module Definition
 * @description 用于解决typescript 下泛型等类型解析
 * https://petstore.swagger.io/v2/swagger.json
 * https://generator3.swagger.io/openapi.json
 */
import RuntimeAnnotation from "../../servlets/annotations/annotation/RuntimeAnnotation";
import MultipartFile from "../../servlets/http/MultipartFile";
import ApiModel from "../annotations/ApiModel";
import ApiModelProperty from "../annotations/ApiModelProperty";
import { ApiModelInfo, ApiModelPropertyInfo, SchemeRef } from "./declare";
import GenericType from "./generic";
import TypeMappings from "./typemappings";

export default class Schemas {

  typemappings = new TypeMappings();

  makeRef(name) {
    return `#/components/schemas/${name}`;
  }

  /**
   * 获取最后可用的定义数据
   * @param dataType 
   */
  build() {
    const schemas: Record<string, ApiModelInfo> = {};
    const models = RuntimeAnnotation.getAnnotations(ApiModel);
    for (let model of models) {
      const anno = model.nativeAnnotation;
      const modelName = model.ctor.name;
      // 判定是否有无继承关系
      const parentModel = models.find((m) => (model.ctor as any).__proto__ == m.ctor);
      // 构建属性
      const properties = this.buildModelProperties(model)
      schemas[modelName] = {
        title: anno.value,
        description: anno.description,
        properties: parentModel ? undefined : properties,
        allOf: parentModel && [
          {
            title: anno.value,
            description: anno.description,
            properties: properties
          },
          { $ref: this.makeRef(parentModel.ctor.name) },
        ]
      }
    }
    // 处理引用类型
    this.buildRefrerences(schemas);
    // 返回定义
    return schemas;
  }

  private buildModelProperties(model: RuntimeAnnotation<InstanceType<typeof ApiModel>>) {
    const properties = RuntimeAnnotation.getAnnotations(ApiModelProperty, model.ctor);
    const modelProperties: Record<string, ApiModelPropertyInfo | SchemeRef> = {};
    for (let property of properties) {
      const anno = property.nativeAnnotation;
      const isGenericTemplate = GenericType.isGeneric(anno.dataType);
      const typeInfo = isGenericTemplate ? { type: anno.dataType } : this.typemappings.make(anno.dataType || anno.example?.constructor);
      modelProperties[property.name] = {
        description: anno.value,
        example: anno.example,
        enum: !anno.enum ? undefined : Object.keys(anno.enum).filter((m: any) => isNaN(m)),
        ...typeInfo
      }
    }
    return modelProperties;
  }

  private buildRefrerences(schemas: Record<string, ApiModelInfo>) {
    for (let genericType of this.typemappings.referenceTypes) {
      this.buildGenericModel(schemas, genericType);
    }
  }

  private buildGenericModel(schemas: Record<string, ApiModelInfo>, refType: SchemeRef) {
    if (!refType.$ref) return;
    const name = refType.$ref.split('schemas/').pop();
    const typeInfo = refType as any as ApiModelPropertyInfo;
    const genericType = new GenericType(name);
    const typeName = genericType.isArray ? genericType.childName : name;
    const isFile = typeName == MultipartFile.name;
    if (genericType.isArray) {
      delete refType.$ref;
      typeInfo.type = 'array';
      if (isFile) {
        typeInfo.items = { type: 'file' };
      } else {
        typeInfo.items = this.typemappings.makeRef(typeName)
      }
    }
    if (schemas[typeName] || isFile) {
      // 如果已存在该类型,则直接忽略
      return;
    }
    const type2 = new GenericType(typeName);
    const baseModel = schemas[type2.name];
    const properties = {};
    if (!baseModel) {
      // 如果没有baseModel，无法生成，跳过
      console.warn('OpenApi: Cannot found ref:' + type2.name)
      return;
    }
    Object.keys(baseModel.properties).map((name: string) => {
      const item = baseModel.properties[name] as ApiModelPropertyInfo;
      if (GenericType.isGeneric(item.type)) {
        const pGenericType = type2.fillTo(item.type);
        properties[name] = this.typemappings.makeRef(pGenericType.toString());
        this.buildGenericModel(schemas, properties[name]);
      } else {
        properties[name] = item;
      }
    })
    schemas[typeName] = {
      ...baseModel,
      properties: properties
    }
  }
}