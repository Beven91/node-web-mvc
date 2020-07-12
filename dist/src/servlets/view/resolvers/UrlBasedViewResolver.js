"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var RedirectView_1 = __importDefault(require("../RedirectView"));
var InternalResourceView_1 = __importDefault(require("../InternalResourceView"));
var IS_REDIRECT = /^redirect:/;
var IS_FORWARD = /^forward:/;
var UrlBasedViewResolver = (function () {
    function UrlBasedViewResolver(prefix, suffix) {
        if (prefix === void 0) { prefix = ''; }
        if (suffix === void 0) { suffix = ''; }
        this.prefix = prefix;
        this.suffix = suffix;
    }
    UrlBasedViewResolver.prototype.resolveViewName = function (viewName, model, request) {
        if (IS_REDIRECT.test(viewName)) {
            return new RedirectView_1.default(viewName.replace(IS_REDIRECT, ''));
        }
        else if (IS_FORWARD.test(viewName)) {
            return new InternalResourceView_1.default(viewName.replace(IS_FORWARD, ''));
        }
        var name = this.prefix + viewName + this.suffix;
        return this.internalResolve(name, model, request);
    };
    UrlBasedViewResolver.prototype.internalResolve = function (viewName, model, request) {
        return null;
    };
    return UrlBasedViewResolver;
}());
exports.default = UrlBasedViewResolver;
//# sourceMappingURL=UrlBasedViewResolver.js.map