"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HandlerInterceptorAdapter = (function () {
    function HandlerInterceptorAdapter() {
    }
    HandlerInterceptorAdapter.prototype.preHandle = function (request, response, handler) {
        return true;
    };
    HandlerInterceptorAdapter.prototype.postHandle = function (request, response, handler, result) {
    };
    HandlerInterceptorAdapter.prototype.afterCompletion = function (request, response, handler, ex) {
    };
    return HandlerInterceptorAdapter;
}());
exports.default = HandlerInterceptorAdapter;
//# sourceMappingURL=HandlerInterceptorAdapter.js.map