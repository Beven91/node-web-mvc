"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var HandlerInteceptorRegistry_1 = __importDefault(require("./HandlerInteceptorRegistry"));
var HandlerMethod_1 = __importDefault(require("../method/HandlerMethod"));
var HandlerExecutionChain = (function () {
    function HandlerExecutionChain(servletContext) {
        this.servletContext = servletContext;
        this.handler = new HandlerMethod_1.default(servletContext);
        this.interceptors = HandlerInteceptorRegistry_1.default.getInterceptors() || [];
    }
    HandlerExecutionChain.prototype.getHandler = function () {
        return this.handler;
    };
    HandlerExecutionChain.prototype.applyPreHandle = function () {
        var _this = this;
        var servletContext = this.servletContext;
        var interceptors = this.interceptors;
        var promise = Promise.resolve(true);
        interceptors.forEach(function (interceptor, i) {
            promise = promise.then(function (result) {
                if (result === false) {
                    return result;
                }
                else {
                    _this.interceptorIndex = i;
                }
                var request = servletContext.request, response = servletContext.response;
                return interceptor.preHandle(request, response, _this.handler);
            });
        });
        return promise;
    };
    HandlerExecutionChain.prototype.applyPostHandle = function (result) {
        var _this = this;
        var servletContext = this.servletContext;
        var interceptors = this.interceptors;
        var promise = Promise.resolve();
        var _loop_1 = function (i) {
            var interceptor = interceptors[i];
            promise = promise.then(function () {
                var request = servletContext.request, response = servletContext.response;
                return interceptor.postHandle(request, response, _this.handler, result);
            });
        };
        for (var i = interceptors.length - 1; i > -1; i--) {
            _loop_1(i);
        }
        return promise.then(function (r) { return (r || result); });
    };
    HandlerExecutionChain.prototype.applyAfterCompletion = function (ex) {
        var _this = this;
        var servletContext = this.servletContext;
        var interceptors = this.interceptors;
        var promise = Promise.resolve();
        var _loop_2 = function (i) {
            var interceptor = interceptors[i];
            promise = promise.then(function () {
                var request = servletContext.request, response = servletContext.response;
                return interceptor.afterCompletion(request, response, _this.handler, ex);
            });
        };
        for (var i = this.interceptorIndex; i > -1; i--) {
            _loop_2(i);
        }
        return promise;
    };
    return HandlerExecutionChain;
}());
exports.default = HandlerExecutionChain;
//# sourceMappingURL=HandlerExecutionChain.js.map