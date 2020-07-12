"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ControllerManagement_1 = __importDefault(require("../ControllerManagement"));
var matcher = __importStar(require("path-to-regexp"));
var ensureArrayPaths = function (value) { return value instanceof Array ? value : [value]; };
var RouteMapping = (function () {
    function RouteMapping(value, method, produces, params, headers, consumes) {
        var _this = this;
        this.rules = null;
        this.method = {};
        this.value = ensureArrayPaths(value);
        this.consumes = typeof consumes === 'string' ? [consumes] : consumes;
        this.produces = produces;
        this.params = params;
        this.headers = headers;
        var methods = ensureArrayPaths(method || ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS']);
        methods.forEach(function (k) {
            _this.method[k.toUpperCase()] = true;
        });
    }
    RouteMapping.create = function (value, method) {
        if (value instanceof RouteMapping) {
            return value;
        }
        var data = (typeof value === 'string' ? { value: value } : value || {});
        data.method = method || data.method;
        return new RouteMapping(data.value, data.method, data.produces, data.params, data.headers, data.consumes);
    };
    RouteMapping.prototype.match = function (req, target, action, actionName) {
        if (!this.rules) {
            this.rules = this.createRules(target, this.value);
        }
        var method = (req.method || '').toUpperCase();
        var rules = this.rules;
        var result = this.matchRules(req.path, rules);
        if (result && this.method[method]) {
            return {
                controller: target,
                action: action,
                controllerName: target.name,
                actionName: actionName,
                params: result.params
            };
        }
    };
    RouteMapping.prototype.createRules = function (target, actionPaths) {
        var descriptor = ControllerManagement_1.default.getControllerDescriptor(target);
        var controllerMapping = (descriptor.mapping || {});
        var controllerPaths = controllerMapping.value || [''];
        var rules = [];
        controllerPaths.forEach(function (controllerPath) {
            actionPaths.forEach(function (actionPath) {
                var exp = (controllerPath + '/' + actionPath).replace(/\/{2,3}/, '/').replace(/\{/g, ':').replace(/\}/g, '');
                rules.push({
                    match: matcher.match(exp),
                    exp: exp
                });
            });
        });
        return rules;
    };
    RouteMapping.prototype.matchRules = function (path, rules) {
        for (var i = 0, k = rules.length; i < k; i++) {
            var result = rules[i].match(path);
            if (result) {
                return result;
            }
        }
    };
    return RouteMapping;
}());
exports.default = RouteMapping;
//# sourceMappingURL=RouteMapping.js.map