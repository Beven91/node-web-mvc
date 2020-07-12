function initialize(Module) {
    var resolveFilename = Module._resolveFilename;
    Module._resolveFilename = function (request, parent, isMain, options) {
        var id = resolveFilename.call(this, request, parent, isMain, options);
        return id.replace(/^[A-Z]:/, function (a) { return a.toLowerCase(); });
    };
}
if (process.env.NODE_ENV !== 'production' && process.platform === 'win32') {
    initialize(module.constructor);
}
//# sourceMappingURL=polyfill.js.map