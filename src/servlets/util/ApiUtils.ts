
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