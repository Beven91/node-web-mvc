"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var HotModule_1 = __importDefault(require("./HotModule"));
var module_1 = __importDefault(require("module"));
var HotReload = (function () {
    function HotReload() {
        this.hotModules = new Map();
    }
    HotReload.prototype.create = function (mod) {
        var id = mod.id;
        if (!this.hotModules.get(id)) {
            mod.hot = new HotModule_1.default(id);
            this.hotModules.set(id, mod.hot);
        }
        return this.hotModules.get(id);
    };
    HotReload.prototype.watch = function (cwd) {
        var _this = this;
        var runtime = { timerId: null };
        fs_1.default.watch(cwd, { recursive: true }, function (type, filename) {
            var id = path_1.default.join(cwd, filename);
            clearTimeout(runtime.timerId);
            runtime.timerId = setTimeout(function () { return _this.handleReload(id); }, _this.reloadTimeout);
        });
    };
    HotReload.prototype.handleReload = function (id) {
        if (!require.cache[id]) {
            return;
        }
        this.buildDependencies();
        var start = Date.now();
        this.reload(id, {});
        var end = new Date();
        this.buildDependencies();
        console.log("Time: " + (end.getTime() - start) + "ms");
        console.log("Built at: " + end.toLocaleDateString() + " " + end.toLocaleTimeString());
        console.log("Hot reload successfully");
    };
    HotReload.prototype.reload = function (id, reloadeds) {
        var _this = this;
        if (reloadeds[id] || !require.cache[id]) {
            return;
        }
        reloadeds[id] = true;
        console.log("Hot reload: " + id + " ...");
        var old = require.cache[id];
        var hot = old.hot;
        var parent = old.parent;
        try {
            hot.invokeHook('pre', {}, old);
            hot.invokeHook('preend', {}, old);
            delete old.hot;
            delete require.cache[id];
            require(id);
            var now_1 = require.cache[id];
            var index = module.children.indexOf(now_1);
            index > -1 ? module.children.splice(index, 1) : undefined;
            var reasons = hot.reasons;
            reasons.forEach(function (reason) {
                if (reason.hooks.accept) {
                    reason.hooks.accept(now_1);
                }
                else {
                    _this.reload(reason.id, reloadeds);
                }
            });
            if (old.parent) {
                now_1.parent = require.cache[old.parent.id];
            }
        }
        catch (ex) {
            var mod = require.cache[id] = (require.cache[id] || old);
            mod.hot = mod.hot || hot;
            mod.parent = parent;
            var finded = module.children.find(function (m) { return m.id === id; });
            var index = module.children.indexOf(finded);
            index > -1 ? module.children.splice(index, 1) : undefined;
            console.error('Hot reload error', ex.stack);
        }
    };
    HotReload.prototype.hotWrap = function () {
        var _this = this;
        var extensions = require.extensions;
        Object.keys(extensions).forEach(function (ext) {
            var handler = extensions[ext];
            extensions[ext] = function (mod, id) {
                var others = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    others[_i - 2] = arguments[_i];
                }
                if (!HotModule_1.default.isInclude(id)) {
                    return handler.apply(void 0, __spreadArrays([mod, id], others));
                }
                var anyModule = mod;
                var parent = _this.create(mod.parent);
                var hot = _this.create(mod);
                anyModule.hot = hot;
                if (module !== mod.parent) {
                    hot.addReason(parent);
                }
                handler.apply(void 0, __spreadArrays([mod, id], others));
                return mod.exports;
            };
        });
    };
    HotReload.prototype.buildDependencies = function () {
        var _this = this;
        var cache = require.cache;
        Object.keys(cache).map(function (k) {
            var mod = cache[k];
            if (HotModule_1.default.isInclude(k)) {
                var hotModule_1 = _this.create(mod);
                mod.children.forEach(function (m) {
                    _this.create(m).addReason(hotModule_1);
                });
            }
        });
    };
    HotReload.prototype.run = function (options) {
        this.options = options;
        this.reloadTimeout = options.reloadTimeout || 300;
        this.hotWrap();
        this.watch(options.cwd);
    };
    return HotReload;
}());
exports.default = new HotReload();
//# sourceMappingURL=index.js.map