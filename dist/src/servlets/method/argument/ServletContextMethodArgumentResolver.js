"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ServletParam_1 = __importDefault(require("../../annotations/params/ServletParam"));
var PathVariableMapMethodArgumentResolver = (function () {
    function PathVariableMapMethodArgumentResolver() {
    }
    PathVariableMapMethodArgumentResolver.prototype.supportsParameter = function (paramater, servletContext) {
        return paramater.hasParameterAnnotation(ServletParam_1.default);
    };
    PathVariableMapMethodArgumentResolver.prototype.resolveArgument = function (parameter, servletContext) {
        switch (parameter.paramType) {
            case 'request':
                return servletContext.request;
            case 'response':
                return servletContext.response;
            case 'next':
                return servletContext.next;
            default:
                return null;
        }
    };
    return PathVariableMapMethodArgumentResolver;
}());
exports.default = PathVariableMapMethodArgumentResolver;
//# sourceMappingURL=ServletContextMethodArgumentResolver.js.map