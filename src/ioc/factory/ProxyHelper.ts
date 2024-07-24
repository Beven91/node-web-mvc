

const instanceSymbol = Symbol('originInstance');

export default {
  isInstanceSymbol(key: string | symbol) {
    return instanceSymbol === key;
  },
  getProxyOriginInstance<T>(instance: any): T {
    if (!instance) {
      return instance;
    }
    return instance[instanceSymbol] || instance;
  }
}