"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ServletExpressContext_1 = __importDefault(require("./servlets/platforms/ServletExpressContext"));
var ServletKoaContext_1 = __importDefault(require("./servlets/platforms/ServletKoaContext"));
var ServletNodeContext_1 = __importDefault(require("./servlets/platforms/ServletNodeContext"));
var ControllerFactory_1 = __importDefault(require("./ControllerFactory"));
var RouteCollection_1 = __importDefault(require("./routes/RouteCollection"));
var WebAppConfigurer_1 = __importDefault(require("./servlets/WebAppConfigurer"));
var registration = {};
var Registry = (function () {
    function Registry() {
    }
    Registry.register = function (name, contextClass) {
        registration[name] = contextClass;
    };
    Registry.registerControllers = function (dir) {
        return ControllerFactory_1.default.registerControllers(dir);
    };
    Registry.launch = function (options) {
        if (!options) {
            throw new Error('请设置options属性,例如:' + JSON.stringify({ mode: 'express|koa' }));
        }
        var configure = WebAppConfigurer_1.default.configurer.initialize(options);
        var HttpContext = registration[configure.mode];
        if (!HttpContext) {
            throw new Error("\n        \u5F53\u524D" + options.mode + "\u6A21\u5F0F\u4E0D\u652F\u6301,\n        \u60A8\u53EF\u4EE5\u901A\u8FC7Registry.register\u6765\u6CE8\u518C\u5BF9\u5E94\u7684\u6267\u884C\u4E0A\u4E0B\u6587\n        Registry.register('" + options.mode + "',ContextClass)\n      ");
        }
        RouteCollection_1.default.base = configure.contextPath;
        return HttpContext.launch(function (request, response, next) {
            var HttpServletContext = HttpContext;
            var context = new HttpServletContext(configure, request, response, next);
            ControllerFactory_1.default.defaultFactory.handle(context);
        });
    };
    return Registry;
}());
exports.default = Registry;
Registry.register('express', ServletExpressContext_1.default);
Registry.register('koa', ServletKoaContext_1.default);
Registry.register('node', ServletNodeContext_1.default);
//# sourceMappingURL=Registry.js.map