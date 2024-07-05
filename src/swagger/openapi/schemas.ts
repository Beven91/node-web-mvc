/**
 * @module Definition
 * @description 用于解决typescript 下泛型等类型解析
 * https://petstore.swagger.io/v2/swagger.json
 * https://generator3.swagger.io/openapi.json
 */
import { ClazzType } from "../../interface/declare";
import MetaProperty from "../../servlets/annotations/annotation/MetaProperty";
import RuntimeAnnotation from "../../servlets/annotations/annotation/RuntimeAnnotation";
import MultipartFile from "../../servlets/http/MultipartFile";
import ApiModel from "../annotations/ApiModel";
import ApiModelProperty from "../annotations/ApiModelProperty";
import { ApiModelInfo, ApiModelPropertyInfo, SchemeRef, SchemeRefExt } from "./declare";
import GenericType from "./generic";
import TypeMappings from "./typemappings";

type A = typeof ApiModelProperty;

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
      this.buildApiModel(model.ctor, model.nativeAnnotation, schemas);
    }
    // 处理引用类型
    this.buildApiModelRefrerences(schemas);
    // 返回定义
    return schemas;
  }

  private buildApiModel(clazzType: ClazzType, anno: InstanceType<typeof ApiModel>, schemas: Record<string, ApiModelInfo>) {
    const modelName = clazzType.name;
    // 构建属性
    const properties = this.buildApiModelProperties(clazzType);
    schemas[modelName] = {
      title: anno.value,
      description: anno.description,
      properties: properties,
      // allOf: parentModel && [
      //   {
      //     title: anno.value,
      //     description: anno.description,
      //     properties: properties
      //   },
      //   { $ref: this.makeRef(parentModel.ctor.name) },
      // ]
    }
  }

  private buildApiModelProperties(clazzType: ClazzType) {
    const modelProperties: Record<string, ApiModelPropertyInfo | SchemeRef> = {};
    const keys = RuntimeAnnotation.getClazzPropertyKeys(clazzType);
    for (let key of keys) {
      if (modelProperties[key]) continue;
      const basicProperty = RuntimeAnnotation.getPropertyAnnotations(clazzType, key)[0];
      const property = RuntimeAnnotation.getPropertyAnnotation(clazzType, key, ApiModelProperty);
      const metaProperty = RuntimeAnnotation.getPropertyAnnotation(clazzType, key, MetaProperty);
      const anno = property?.nativeAnnotation;
      const dataType = anno?.dataType || basicProperty?.dataType || anno.example?.constructor;
      const name = property?.name || basicProperty?.name;
      const isGenericTemplate = GenericType.isGeneric(dataType);
      const typeInfo = isGenericTemplate ? { type: dataType } : this.typemappings.make(dataType, metaProperty?.nativeAnnotation?.itemType);
      modelProperties[name] = {
        description: anno?.value || metaProperty?.nativeAnnotation?.desc,
        example: anno?.example,
        enum: !anno?.enum ? undefined : Object.keys(anno.enum).filter((m: any) => isNaN(m)),
        ...typeInfo
      }
    }
    return modelProperties;
  }

  private buildApiModelRefrerences(schemas: Record<string, ApiModelInfo>) {
    for (let genericType of this.typemappings.referenceTypes) {
      this.buildApiGenericModel(schemas, genericType);
    }
  }

  private buildApiGenericModel(schemas: Record<string, ApiModelInfo>, refType: SchemeRefExt) {
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
    let baseModel = schemas[type2.name];
    const properties = {};
    if (!baseModel && refType.clazzType) {
      const clazzType = refType.clazzType;
      const anno = { value: clazzType.name, description: '' };
      this.buildApiModel(refType.clazzType, anno, schemas);
      baseModel = schemas[type2.name];
    }
    if (!baseModel && !refType.clazzType) {
      // 如果没有baseModel，无法生成，跳过
      console.warn('OpenApi: Cannot found ref:' + type2.name)
      return;
    }
    Object.keys(baseModel.properties).map((name: string) => {
      const item = baseModel.properties[name] as ApiModelPropertyInfo;
      if (GenericType.isGeneric(item.type)) {
        const pGenericType = type2.fillTo(item.type);
        properties[name] = this.typemappings.makeRef(pGenericType.toString());
        this.buildApiGenericModel(schemas, properties[name]);
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