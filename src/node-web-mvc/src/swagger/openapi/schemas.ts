/**
 * @module Definition
 * @description 用于解决typescript 下泛型等类型解析
 * https://petstore.swagger.io/v2/swagger.json
 * https://generator3.swagger.io/openapi.json
 */
import { ClazzType } from '../../interface/declare';
import { buildRuntimeType } from '../../servlets/annotations/annotation/metadata';
import RuntimeAnnotation from '../../servlets/annotations/annotation/RuntimeAnnotation';
import { MetaRuntimeTypeInfo } from '../../servlets/annotations/annotation/type';
import ApiModel from '../annotations/ApiModel';
import ApiModelProperty from '../annotations/ApiModelProperty';
import { ApiModelInfo, ApiModelPropertyInfo, SchemeRef, GenericTypeSchemeRefExt } from './declare';
import TypeMappings from './typemappings';

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
    for (const model of models) {
      this.buildApiModel(model.ctor, model.nativeAnnotation, schemas);
    }
    // 处理引用类型
    this.buildApiModelRefrerences(schemas);
    // 返回定义
    return schemas;
  }

  private buildApiModel(clazzType: ClazzType, anno: InstanceType<typeof ApiModel>, schemas: Record<string, ApiModelInfo>, fillRuntimeType = false) {
    const modelName = clazzType.name;
    // 构建属性
    const properties = this.buildApiModelProperties(clazzType, fillRuntimeType);
    return schemas[modelName] = {
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
    };
  }

  private buildApiModelProperties(clazzType: ClazzType, fillRuntimeType = false) {
    const modelProperties: Record<string, ApiModelPropertyInfo | SchemeRef> = {};
    const keys = RuntimeAnnotation.getClazzPropertyKeys(clazzType);
    for (const key of keys) {
      if (modelProperties[key]) continue;
      const basicProperty = RuntimeAnnotation.getPropertyAnnotations(clazzType, key)[0];
      const property = RuntimeAnnotation.getPropertyAnnotation(clazzType, key, ApiModelProperty);
      const anno = property?.nativeAnnotation;
      const dataType = basicProperty?.dataType || buildRuntimeType(anno.example?.constructor, null);
      const name = property?.name || basicProperty?.name;
      const typeInfo = this.typemappings.make(dataType);
      modelProperties[name] = {
        description: anno?.value,
        example: anno?.example,
        runtimeType: fillRuntimeType ? dataType : undefined,
        enum: !anno?.enum ? undefined : Object.keys(anno.enum).filter((m: any) => isNaN(m)),
        ...typeInfo,
      };
    }
    return modelProperties;
  }

  private buildApiModelRefrerences(schemas: Record<string, ApiModelInfo>) {
    for (const genericType of this.typemappings.referenceTypes) {
      this.buildApiGenericModel(schemas, genericType);
    }
  }

  private buildApiGenericModel(schemas: Record<string, ApiModelInfo>, genericTypeRef: GenericTypeSchemeRefExt) {
    const refType = genericTypeRef.refType;
    const name = genericTypeRef.name;
    const runtimeType = genericTypeRef.runtimeType;
    if (!refType.$ref || schemas[name]) {
      // 如果当前泛型已构建过，则跳过
      return;
    }
    const anno = { value: runtimeType.fullName, description: '' };
    const model = this.buildApiModel(runtimeType.clazz, anno, schemas, true);
    const properties = {};
    // if (!baseModel && !genericTypeRef.clazzType) {
    //   // 如果没有baseModel，无法生成，跳过
    //   console.warn('OpenApi: Cannot found ref:' + type2.name);
    //   return;
    // }
    Object.keys(model.properties).map((key: string) => {
      const item = model.properties[key] as ApiModelPropertyInfo;
      const itemRuntimeType = item.runtimeType;
      if (itemRuntimeType.tp) {
        // 如果是泛型填充类型
        const fillType = runtimeType.args.find((m) => m.at == itemRuntimeType.name);
        const newFillType:MetaRuntimeTypeInfo = {
          ...fillType,
          fullName: fillType.name,
        };
        properties[key] = fillType ? this.typemappings.make(newFillType) : item;
      } else if (itemRuntimeType.args?.length > 0) {
        const newArgs = itemRuntimeType.args.map((m, i) => {
          if (!m.tp) {
            return m;
          }
          return runtimeType.args.find((r)=>r.at == m.name) || m;
        });
        // 如果当前属性为泛型
        const newRuntimeType: MetaRuntimeTypeInfo = {
          ...itemRuntimeType,
          args: newArgs,
          fullName: itemRuntimeType.name + `<${newArgs.map((m) => `${m.name}${m.array ? '[]' : ''}`).join(',')}>`,
          tp: false,
        };
        const info = this.typemappings.make(newRuntimeType);
        properties[key] = info;
      } else {
        properties[key] = item;
      }
      // 删除runtimeType属性
      delete item.runtimeType;
    });
    schemas[name] = {
      ...model,
      properties: properties,
    };
  }
}
