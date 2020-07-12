"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var PathVariable_1 = __importDefault(require("../../annotations/params/PathVariable"));
var PathVariableMapMethodArgumentResolver = (function () {
    function PathVariableMapMethodArgumentResolver() {
    }
    PathVariableMapMethodArgumentResolver.prototype.supportsParameter = function (paramater, servletContext) {
        return paramater.hasParameterAnnotation(PathVariable_1.default);
    };
    PathVariableMapMethodArgumentResolver.prototype.resolveArgument = function (parameter, servletContext) {
        return servletContext.request.pathVariables[parameter.value];
    };
    return PathVariableMapMethodArgumentResolver;
}());
exports.default = PathVariableMapMethodArgumentResolver;
//# sourceMappingURL=PathVariableMapMethodArgumentResolver.js.map