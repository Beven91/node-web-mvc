

interface ClassType {
  new(...args: any[]): any
}

const blacklist = ['length', 'name', 'prototype'];

function extendInstance(target: any, parentType: ClassType, args: any[], wrapper: Function) {
  const ParentClazz = parentType;
  const parent = new ParentClazz(...args);
  let proto = target.__proto__;
  while (proto) {
    if (proto.constructor == Object) {
      break;
    }
    if (proto.constructor == wrapper) {
      proto.__proto__ = parent;
    }
    proto = proto.__proto__;
  }
}

function extendStatic(target: any, source: any) {
  Reflect.ownKeys(source).forEach((k) => {
    if (typeof k == 'string' && blacklist.indexOf(k) < 0) {
      target[k] = source[k];
    }
  })
}

export default {
  extendInstance,
  extendStatic
}