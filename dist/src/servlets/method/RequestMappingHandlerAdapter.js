"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var AbstractHandlerMethodAdapter_1 = __importDefault(require("./AbstractHandlerMethodAdapter"));
var ArgumentsResolvers_1 = __importDefault(require("./argument/ArgumentsResolvers"));
var RequestMappingHandlerAdapter = (function (_super) {
    __extends(RequestMappingHandlerAdapter, _super);
    function RequestMappingHandlerAdapter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RequestMappingHandlerAdapter.prototype.supportsInternal = function () {
        return true;
    };
    RequestMappingHandlerAdapter.prototype.handleInternal = function (servletContext, handler) {
        var resolvedArgs = ArgumentsResolvers_1.default.resolveArguments(servletContext, handler);
        return Promise.resolve(resolvedArgs).then(function (args) {
            return handler.invoke.apply(handler, args);
        });
    };
    return RequestMappingHandlerAdapter;
}(AbstractHandlerMethodAdapter_1.default));
exports.default = RequestMappingHandlerAdapter;
//# sourceMappingURL=RequestMappingHandlerAdapter.js.map