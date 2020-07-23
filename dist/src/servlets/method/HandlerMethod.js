"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ControllerManagement_1 = __importDefault(require("../../ControllerManagement"));
var ServletModel_1 = __importDefault(require("../models/ServletModel"));
var InterruptModel_1 = __importDefault(require("../models/InterruptModel"));
var MethodParameter_1 = __importDefault(require("../../interface/MethodParameter"));
var Javascript_1 = __importDefault(require("../../interface/Javascript"));
var RuntimeAnnotation_1 = __importDefault(require("../annotations/annotation/RuntimeAnnotation"));
var HandlerMethod = (function () {
    function HandlerMethod(servletContext) {
        var _this = this;
        this.servletContext = servletContext;
        this.paramsDictionary = {};
        this.resolveParameters.forEach(function (parameter) {
            _this.paramsDictionary[parameter.name || parameter.value] = parameter;
        });
    }
    Object.defineProperty(HandlerMethod.prototype, "method", {
        get: function () {
            return this.servletContext.action;
        },
        enumerable: false,
        configurable: true
    });
    HandlerMethod.prototype.getResolveParameter = function (name) {
        return this.paramsDictionary[name];
    };
    Object.defineProperty(HandlerMethod.prototype, "signParameters", {
        get: function () {
            return Javascript_1.default.resolveParameters(this.method);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HandlerMethod.prototype, "controller", {
        get: function () {
            return this.servletContext.controller;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HandlerMethod.prototype, "resolveParameters", {
        get: function () {
            var _a = this.servletContext, Controller = _a.Controller, actionName = _a.actionName;
            return RuntimeAnnotation_1.default.getMethodParamAnnotations(Controller, actionName).map(function (annotation) {
                var name = annotation.nativeAnnotation.constructor.name;
                return annotation.nativeAnnotation.param || new MethodParameter_1.default({ value: annotation.paramName }, name, annotation);
            });
        },
        enumerable: false,
        configurable: true
    });
    HandlerMethod.prototype.evaluateResponseStatus = function () {
        var actionDescriptor = this.getMethodAnnotations();
        var annotation = actionDescriptor.responseStatus;
        if (annotation != null) {
            this.responseStatus = annotation.code;
            this.responseStatusReason = annotation.reason;
        }
    };
    HandlerMethod.prototype.getMethodAnnotations = function (ctor) {
        var descriptor = ControllerManagement_1.default.getControllerDescriptor(this.servletContext.Controller);
        if (!ctor) {
            return descriptor.actions[this.servletContext.actionName];
        }
    };
    HandlerMethod.prototype.invoke = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _a, controller, action, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.servletContext, controller = _a.controller, action = _a.action;
                        return [4, action.call.apply(action, __spreadArrays([controller], args))];
                    case 1:
                        data = _b.sent();
                        if (this.servletContext.isNextInvoked && data === undefined) {
                            return [2, new InterruptModel_1.default()];
                        }
                        this.evaluateResponseStatus();
                        return [2, new ServletModel_1.default(data)];
                }
            });
        });
    };
    return HandlerMethod;
}());
exports.default = HandlerMethod;
//# sourceMappingURL=HandlerMethod.js.map