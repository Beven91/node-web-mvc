"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var registerResolvers = [];
var ViewResolverRegistry = (function () {
    function ViewResolverRegistry() {
    }
    Object.defineProperty(ViewResolverRegistry, "viewResolvers", {
        get: function () {
            return registerResolvers;
        },
        enumerable: false,
        configurable: true
    });
    ViewResolverRegistry.addViewResolver = function (resolver) {
        registerResolvers.push(resolver);
    };
    return ViewResolverRegistry;
}());
exports.default = ViewResolverRegistry;
//# sourceMappingURL=ViewResolverRegistry.js.map