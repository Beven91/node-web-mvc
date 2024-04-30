
export const isEmpty = (v: any) => v === undefined || v === null || v === '';

export const equalsIgnoreCase = (v1:string, v2:string) => {
  if(v1 === v2) {
    return true;
  }
  return String(v1).toLowerCase() == String(v2).toLowerCase();
}