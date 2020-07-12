"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ControllerManagement_1 = __importDefault(require("../../ControllerManagement"));
var MessageConverter_1 = __importDefault(require("../http/converts/MessageConverter"));
var MediaType_1 = __importDefault(require("../http/MediaType"));
var ModelAndView_1 = __importDefault(require("../models/ModelAndView"));
var ViewResolverRegistry_1 = __importDefault(require("../view/ViewResolverRegistry"));
var ViewNotFoundError_1 = __importDefault(require("../../errors/ViewNotFoundError"));
var HttpResponseProduces = (function () {
    function HttpResponseProduces(servletContext) {
        this.servletContext = null;
        this.actionMapping = null;
        var actionName = servletContext.actionName;
        var Controller = servletContext.Controller;
        var descriptor = ControllerManagement_1.default.getControllerDescriptor(Controller);
        var actions = descriptor.actions;
        var action = (actions[actionName] || {});
        this.servletContext = servletContext;
        this.actionMapping = (action.mapping || {});
    }
    HttpResponseProduces.prototype.produce = function (model, handler) {
        var _this = this;
        return Promise
            .resolve(model.data)
            .then(function (data) { return _this.handleProduces(data, handler); })
            .catch(function (ex) { return _this.servletContext.next(ex); });
    };
    HttpResponseProduces.prototype.handleProduces = function (data, handler) {
        if (data instanceof ModelAndView_1.default) {
            return this.handleViewResponse(data);
        }
        else {
            return this.handleModelResponse(data, handler);
        }
    };
    HttpResponseProduces.prototype.handleViewResponse = function (mv) {
        var _a = this.servletContext, request = _a.request, response = _a.response;
        return Promise
            .resolve(this.resolveViewName(mv))
            .then(function (view) { return view.render(mv.model, request, response); })
            .catch(function (error) {
            response.setStatus(500, error.message).end();
        });
    };
    HttpResponseProduces.prototype.handleModelResponse = function (data, handler) {
        var responseStatus = handler.responseStatus, responseStatusReason = handler.responseStatusReason;
        var useStatus = !(responseStatus === null || responseStatus === undefined);
        var status = useStatus ? responseStatus : 200;
        var _a = this, actionMapping = _a.actionMapping, servletContext = _a.servletContext;
        var produces = actionMapping.produces;
        var response = servletContext.response;
        var mediaType = new MediaType_1.default(produces || response.nativeContentType || 'text/plain');
        response.setHeader('Content-Type', mediaType.name);
        response.setStatus(status, responseStatusReason);
        return MessageConverter_1.default
            .write(data, mediaType, servletContext)
            .then(function () { return servletContext.response.end(); })
            .then(function () { return data; });
    };
    HttpResponseProduces.prototype.resolveViewName = function (mv) {
        var request = this.servletContext.request;
        var viewResolvers = ViewResolverRegistry_1.default.viewResolvers;
        for (var _i = 0, viewResolvers_1 = viewResolvers; _i < viewResolvers_1.length; _i++) {
            var resolver = viewResolvers_1[_i];
            var view = resolver.resolveViewName(mv.view, mv.model, request);
            if (view) {
                return view;
            }
        }
        throw new ViewNotFoundError_1.default(mv.view);
    };
    return HttpResponseProduces;
}());
exports.default = HttpResponseProduces;
//# sourceMappingURL=HttpResponseProduces.js.map