"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var HotModule = (function () {
    function HotModule(id) {
        this.id = id;
        this.reasons = [];
        this.hooks = {};
    }
    Object.defineProperty(HotModule.prototype, "nativeExports", {
        get: function () {
            return require.cache[this.id].exports;
        },
        enumerable: false,
        configurable: true
    });
    HotModule.isInclude = function (filename) {
        return !/node_modules/.test(filename);
    };
    HotModule.prototype.accept = function (handler) {
        this.hooks.accept = handler;
    };
    HotModule.prototype.preload = function (handler) {
        this.hooks.pre = handler;
    };
    HotModule.prototype.preend = function (handler) {
        this.hooks.preend = handler;
    };
    HotModule.prototype.invokeHook = function (name, invokes) {
        var _a;
        var params = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            params[_i - 2] = arguments[_i];
        }
        if (invokes[this.id] || !require.cache[this.id]) {
            return;
        }
        else if (this.hooks[name]) {
            (_a = this.hooks)[name].apply(_a, params);
        }
        invokes[this.id] = true;
        try {
            var mod = require.cache[this.id];
            var children = mod.children;
            children.forEach(function (child) {
                var _a;
                if (HotModule.isInclude(child.filename)) {
                    child.hot = child.hot || new HotModule(child.filename);
                }
                if (child.hot) {
                    (_a = child.hot).invokeHook.apply(_a, __spreadArrays([name, invokes], params));
                }
            });
        }
        catch (ex) {
            console.error(ex.stack);
        }
    };
    HotModule.prototype.addReason = function (hotModule) {
        if (this.reasons.indexOf(hotModule) < 0) {
            this.reasons.push(hotModule);
        }
    };
    return HotModule;
}());
exports.default = HotModule;
//# sourceMappingURL=HotModule.js.map