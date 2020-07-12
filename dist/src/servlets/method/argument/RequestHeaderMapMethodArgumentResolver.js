"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var RequestHeader_1 = __importDefault(require("../../annotations/params/RequestHeader"));
var RequestHeaderMapMethodArgumentResolver = (function () {
    function RequestHeaderMapMethodArgumentResolver() {
    }
    RequestHeaderMapMethodArgumentResolver.prototype.supportsParameter = function (paramater, servletContext) {
        return paramater.hasParameterAnnotation(RequestHeader_1.default);
    };
    RequestHeaderMapMethodArgumentResolver.prototype.resolveArgument = function (parameter, servletContext) {
        return servletContext.request.headers[parameter.value];
    };
    return RequestHeaderMapMethodArgumentResolver;
}());
exports.default = RequestHeaderMapMethodArgumentResolver;
//# sourceMappingURL=RequestHeaderMapMethodArgumentResolver.js.map