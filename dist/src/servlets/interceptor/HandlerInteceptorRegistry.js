"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interceptors = [];
var HandlerInteceptorRegistry = (function () {
    function HandlerInteceptorRegistry() {
    }
    HandlerInteceptorRegistry.getInterceptors = function () {
        return interceptors;
    };
    HandlerInteceptorRegistry.addInterceptor = function (interceptor) {
        interceptors.push(interceptor);
    };
    return HandlerInteceptorRegistry;
}());
exports.default = HandlerInteceptorRegistry;
//# sourceMappingURL=HandlerInteceptorRegistry.js.map