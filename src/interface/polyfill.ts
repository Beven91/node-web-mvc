/**
 * @module Polyfill
 * @pdescription 用于解决windows下vscode 盘符大写问题
 */

function initialize(Module) {
  const resolveFilename = Module._resolveFilename;
  Module._resolveFilename = function (request, parent, isMain, options) {
    const id = resolveFilename.call(this, request, parent, isMain, options);
    return id.replace(/^[A-Z]:/, (a) => a.toLowerCase());
  }
}

if (process.env.NODE_ENV !== 'production' && process.platform === 'win32') {
  initialize(module.constructor);
}

