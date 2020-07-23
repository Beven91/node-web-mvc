"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PathVariableMapMethodArgumentResolver = (function () {
    function PathVariableMapMethodArgumentResolver() {
    }
    PathVariableMapMethodArgumentResolver.prototype.supportsParameter = function (paramater, servletContext) {
        return paramater.paramType === 'request' || paramater.paramType === 'response';
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