"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var HandlerMethod_1 = __importDefault(require("./HandlerMethod"));
var AbstractHandlerMethodAdapter = (function () {
    function AbstractHandlerMethodAdapter() {
    }
    AbstractHandlerMethodAdapter.prototype.supports = function (handler) {
        return (handler instanceof HandlerMethod_1.default && this.supportsInternal(handler));
    };
    AbstractHandlerMethodAdapter.prototype.handle = function (servletContext, handler) {
        return this.handleInternal(servletContext, handler);
    };
    AbstractHandlerMethodAdapter.prototype.getLastModified = function (request, handler) { };
    return AbstractHandlerMethodAdapter;
}());
exports.default = AbstractHandlerMethodAdapter;
//# sourceMappingURL=AbstractHandlerMethodAdapter.js.map