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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var querystring_1 = __importDefault(require("querystring"));
var View_1 = __importDefault(require("./View"));
var ControllerFactory_1 = __importDefault(require("../../ControllerFactory"));
var DispatcherServlet_1 = __importDefault(require("../DispatcherServlet"));
var ForwardEndlessLoopError_1 = __importDefault(require("../../errors/ForwardEndlessLoopError"));
var InternalResourceView = (function (_super) {
    __extends(InternalResourceView, _super);
    function InternalResourceView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InternalResourceView.prototype.render = function (model, request, response) {
        var _this = this;
        var url = new URL(this.url);
        var servletContext = request.servletContext;
        var isLoop = !!servletContext.forwardStacks.find(function (f) { return f === _this.url; });
        if (isLoop) {
            throw new ForwardEndlessLoopError_1.default(servletContext.forwardStacks);
        }
        servletContext.forwardStacks.push(this.url);
        request.path = url.pathname;
        request.host = url.hostname;
        request.query = __assign(__assign({}, (request.query || {})), (querystring_1.default.parse((url.search || '').slice(1))));
        var pathVariables = request.pathVariables || {};
        ControllerFactory_1.default.defaultFactory.createController(request.servletContext);
        request.pathVariables = __assign(__assign({}, pathVariables), (request.pathVariables || {}));
        return (new DispatcherServlet_1.default()).doService(request.servletContext);
    };
    return InternalResourceView;
}(View_1.default));
exports.default = InternalResourceView;
//# sourceMappingURL=InternalResourceView.js.map