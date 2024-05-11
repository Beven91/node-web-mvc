import { Multipart } from "../config/WebAppConfigurerOptions";
import MultipartFile from "../http/MultipartFile";

export const isEmpty = (v: any) => v === undefined || v === null || v === '';

export const equalsIgnoreCase = (v1: string, v2: string) => {
  if (v1 === v2) {
    return true;
  }
  return String(v1).toLowerCase() == String(v2).toLowerCase();
}

export const isSimpleValueType = (type: any) => {
  return (
    type === undefined ||
    type === null ||
    Number.isNaN(type) ||
    type === Number ||
    type == String ||
    type === Date ||
    type == URL ||
    type == Boolean ||
    type == RegExp ||
    type == BigInt ||
    type == Math
  );
}

export const getVariableName = (type: Function) => {
  const beanName = String(type?.name);
  return beanName.slice(0, 1).toLowerCase() + beanName.slice(1, beanName.length);
}

export const isMultipartFiles = (value: any) => {
  const v = value instanceof Array ? value : [value];
  return v.find((m) => !(m instanceof MultipartFile)) == null;
}

export const emptyOf = (value: any, defaultValue: any) => {
  return isEmpty(value) ? defaultValue : value;
}