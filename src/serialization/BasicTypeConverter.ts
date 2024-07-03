import ValueConvertError from "../errors/ValueConvertError";
import { ClazzType } from "../interface/declare";

export function toBigInt(value: any) {
  try {
    return BigInt(value);
  } catch (ex) {
    throw new ValueConvertError(value, BigInt);
  }
}

export function toString(value: any, constructor?: ClazzType) {
  if (value === null || value === undefined) {
    return null;
  } else if (constructor && constructor !== String) {
    return new constructor(value);
  }
  return value.toString();
}

export function toNumber(value: any, constructor?: ClazzType) {
  if (isNaN(value)) {
    throw new ValueConvertError(value, Number);
  } else if (constructor && constructor !== Number) {
    return new constructor(value);
  }
  return Number(value);
}

export function toBoolean(value: any) {
  if (typeof value === 'boolean') {
    return value;
  } else if (value == 0 || value === 'false') {
    return false;
  } else if (value == 1 || value === 'true') {
    return true;
  }
  throw new ValueConvertError(value, Boolean);
}

export function toDate(value: any, constructor?: ClazzType) {
  constructor = constructor || Date;
  const date = new constructor(value);
  if (/Invalid/.test(date.toString())) {
    throw new ValueConvertError(value, Date);
  }
  return date;
}
