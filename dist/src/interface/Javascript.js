"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var empty = {};
var protoKeys = Reflect.ownKeys(empty.__proto__).reduce(function (map, k) { return (map[k] = true, map); }, {});
var symbol = Symbol('@parameters');
var Javascript = (function () {
    function Javascript() {
    }
    Object.defineProperty(Javascript, "protoKeys", {
        get: function () {
            return protoKeys;
        },
        enumerable: false,
        configurable: true
    });
    Javascript.resolveParameters = function (handler) {
        if (typeof handler !== 'function') {
            return [];
        }
        if (!handler[symbol]) {
            var parts = handler.toString().split('(')[1] || '';
            var express = parts.split(')')[0] || '';
            handler[symbol] = express.split(',').map(function (s) { return s.trim(); }).filter(function (s) { return !!s; });
        }
        return handler[symbol];
    };
    return Javascript;
}());
exports.default = Javascript;
//# sourceMappingURL=Javascript.js.map