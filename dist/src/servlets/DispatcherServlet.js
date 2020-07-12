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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ServletModel_1 = __importDefault(require("./models/ServletModel"));
var HandlerExecutionChain_1 = __importDefault(require("./interceptor/HandlerExecutionChain"));
var RequestMappingHandlerAdapter_1 = __importDefault(require("./method/RequestMappingHandlerAdapter"));
var HttpResponseProduces_1 = __importDefault(require("./producers/HttpResponseProduces"));
var InterruptModel_1 = __importDefault(require("./models/InterruptModel"));
var ControllerManagement_1 = __importDefault(require("../ControllerManagement"));
var DispatcherServlet = (function () {
    function DispatcherServlet() {
    }
    DispatcherServlet.prototype.getHandler = function (servletContext) {
        return new HandlerExecutionChain_1.default(servletContext);
    };
    DispatcherServlet.prototype.getHandlerAdapter = function (handler) {
        return new RequestMappingHandlerAdapter_1.default();
    };
    DispatcherServlet.prototype.doService = function (servletContext) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    return [2, this.doDispatch(servletContext)];
                }
                catch (ex) {
                    return [2, Promise.reject(ex)];
                }
                return [2];
            });
        });
    };
    DispatcherServlet.prototype.doDispatch = function (servletContext) {
        return __awaiter(this, void 0, void 0, function () {
            var runtime, mappedHandler, isKeeping, ha, _a, ex_1, _b, _c, ex_2;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        runtime = { res: null, error: null };
                        mappedHandler = this.getHandler(servletContext);
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 9, , 10]);
                        return [4, mappedHandler.applyPreHandle()];
                    case 2:
                        isKeeping = _d.sent();
                        if (!isKeeping) {
                            return [2, new InterruptModel_1.default()];
                        }
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 7]);
                        ha = this.getHandlerAdapter(mappedHandler.getHandler());
                        _a = runtime;
                        return [4, ha.handle(servletContext, mappedHandler.getHandler())];
                    case 4:
                        _a.res = _d.sent();
                        return [3, 7];
                    case 5:
                        ex_1 = _d.sent();
                        _b = runtime;
                        return [4, this.handleException(ex_1, servletContext)];
                    case 6:
                        _b.res = _d.sent();
                        return [3, 7];
                    case 7:
                        _c = runtime;
                        return [4, mappedHandler.applyPostHandle(runtime.res)];
                    case 8:
                        _c.res = _d.sent();
                        return [2, (new HttpResponseProduces_1.default(servletContext)).produce(runtime.res, mappedHandler.getHandler())];
                    case 9:
                        ex_2 = _d.sent();
                        runtime.error = ex_2;
                        return [3, 10];
                    case 10:
                        process.nextTick(function () {
                            mappedHandler.applyAfterCompletion(runtime.error);
                        });
                        return [2, runtime.error ? Promise.reject(runtime.error) : runtime.res];
                }
            });
        });
    };
    DispatcherServlet.prototype.handleException = function (error, servletContext) {
        var Controller = servletContext.Controller, controller = servletContext.controller;
        var advice = ControllerManagement_1.default.controllerAdviceInstance;
        var controllerDescriptors = ControllerManagement_1.default.getControllerDescriptor(Controller);
        var adviceDescriptors = advice ? ControllerManagement_1.default.getControllerDescriptor(advice.constructor) : null;
        console.error(error.stack || error);
        if (controllerDescriptors.exceptionHandler) {
            var res = controllerDescriptors.exceptionHandler.call(controller, error);
            return Promise.resolve(new ServletModel_1.default(res));
        }
        else if (adviceDescriptors && adviceDescriptors.exceptionHandler) {
            var res = adviceDescriptors.exceptionHandler.call(advice, error);
            return Promise.resolve(new ServletModel_1.default(res));
        }
        else {
            return Promise.reject(error);
        }
    };
    return DispatcherServlet;
}());
exports.default = DispatcherServlet;
//# sourceMappingURL=DispatcherServlet.js.map