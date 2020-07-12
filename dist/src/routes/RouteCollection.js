"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var hot_1 = __importDefault(require("../hot"));
var RouteCollection = (function () {
    function RouteCollection() {
    }
    RouteCollection.mapRoute = function (exp, defaultOptions) {
        if (exp === '') {
            throw new Error('exp 不能为空');
        }
        exp = exp[0] === '/' ? exp.slice(1) : exp;
        this.routes = this.routes || [];
        this.routes.push({ url: exp, options: (defaultOptions || {}) });
    };
    RouteCollection.mapRule = function (rule) {
        if (rule) {
            this.rules = this.rules || [];
            this.rules.push(rule);
        }
    };
    RouteCollection.match = function (req) {
        return this.rulesMatch(req) || this.basicMatch(req.path);
    };
    RouteCollection.rulesMatch = function (req) {
        var rules = this.rules || [];
        var request = {
            method: req.method,
            path: this.base ? req.path.replace(new RegExp('^' + this.base), '') : req.path
        };
        for (var i = 0, k = rules.length; i < k; i++) {
            var rule = rules[i];
            var result = rule.match(request, this.base);
            if (result) {
                return {
                    controller: result.controller,
                    action: result.action,
                    controllerName: result.controllerName,
                    actionName: result.actionName,
                    params: result.params || {}
                };
            }
        }
    };
    RouteCollection.basicMatch = function (path) {
        path = this.base ? path.replace(new RegExp('^' + this.base), '') : path;
        path = path[0] === '/' ? path.slice(1) : path;
        var parts = path.split('/');
        var routes = this.routes || [];
        var _loop_1 = function (i, k) {
            var matchRoute = {};
            var route = routes[i];
            var defaultOptions = (route.options || {});
            var rules = route.url.split('/');
            if (rules.length < parts.length) {
                return "continue";
            }
            var matched = rules.filter(function (rule, index) {
                if (rule.indexOf('{') > -1) {
                    var name_1 = rule.replace('{', '').replace('}', '').trim();
                    matchRoute[name_1] = parts[index];
                    return false;
                }
                return rule !== parts[index];
            }).length < 1;
            if (matched) {
                matchRoute.controllerName = matchRoute.controller || defaultOptions.controller || '';
                matchRoute.actionName = matchRoute.action || defaultOptions.action || '';
                return { value: matchRoute };
            }
        };
        for (var i = 0, k = routes.length; i < k; i++) {
            var state_1 = _loop_1(i, k);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return {};
    };
    RouteCollection.routes = [];
    RouteCollection.rules = [];
    RouteCollection.base = '';
    return RouteCollection;
}());
exports.default = RouteCollection;
module.exports = RouteCollection;
hot_1.default.create(module).preload(function (old) {
    var controllerClass = old.exports.default || old.exports;
    if (typeof controllerClass !== 'function') {
        return;
    }
    RouteCollection.rules = RouteCollection.rules.filter(function (rule) {
        return rule.controller !== controllerClass;
    });
});
//# sourceMappingURL=RouteCollection.js.map