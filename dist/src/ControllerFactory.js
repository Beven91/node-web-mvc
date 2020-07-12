"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var RouteCollection_1 = __importDefault(require("./routes/RouteCollection"));
var ControllerManagement_1 = __importDefault(require("./ControllerManagement"));
var InterruptModel_1 = __importDefault(require("./servlets/models/InterruptModel"));
var DispatcherServlet_1 = __importDefault(require("./servlets/DispatcherServlet"));
var logger = console;
var defaultArea = "";
var registedAreaControllers = ({});
var defaultFactoryController = null;
var ControllerFactory = (function () {
    function ControllerFactory() {
    }
    Object.defineProperty(ControllerFactory, "defaultFactory", {
        get: function () {
            if (!defaultFactoryController) {
                defaultFactoryController = new ControllerFactory();
            }
            return defaultFactoryController;
        },
        set: function (value) {
            defaultFactoryController = value;
        },
        enumerable: false,
        configurable: true
    });
    ControllerFactory.isController = function (controllerClass) {
        return controllerClass && controllerClass.prototype && controllerClass.prototype.isController === true;
    };
    ControllerFactory.getAreaControllers = function (area, ensure) {
        area = area || '';
        var areaRegisterControllers = registedAreaControllers[area];
        if (ensure && !areaRegisterControllers) {
            areaRegisterControllers = registedAreaControllers[area] = {};
        }
        return areaRegisterControllers;
    };
    ControllerFactory.registerController = function (controllerClass, areaName) {
        if (areaName === null || areaName === undefined) {
            throw new Error("areaName Cannot be null or undefined");
        }
        if (this.isController(controllerClass)) {
            var areaRegisterControllers = this.getAreaControllers(areaName, true);
            var controllerName = controllerClass.controllerName;
            controllerName = controllerName || (controllerClass.name || '').replace('Controller', '');
            controllerName = controllerName.toLowerCase();
            logger.info("Register Controller: " + controllerName + "(Area:" + (areaName || 'default') + ")");
            areaRegisterControllers[controllerName] = controllerClass;
        }
        else {
        }
    };
    ControllerFactory.registerControllers = function (dir) {
        var _this = this;
        var files = fs_1.default.readdirSync(dir).filter(function (name) {
            var ext = path_1.default.extname(name);
            return ext === '.js' || ext === '.ts';
        });
        files.forEach(function (name) {
            var file = path_1.default.join(dir, name);
            var controllerClass = require(file) || {};
            controllerClass.__file = file;
            _this.registerController(controllerClass, defaultArea);
        });
    };
    ControllerFactory.registerAreaControllers = function (areaName, dir) {
        var _this = this;
        if (areaName === null || areaName === undefined) {
            throw new Error("areaName Cannot be null or undefined");
        }
        var files = fs_1.default.readdirSync(dir).filter(function (name) { return path_1.default.extname(name) === '.js'; });
        files.forEach(function (name) {
            var file = path_1.default.join(dir, name);
            var controllerClass = require(file) || {};
            controllerClass.__file = file;
            _this.registerController(controllerClass, areaName);
        });
    };
    ControllerFactory.prototype.executeController = function (servletContext) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.createController(servletContext);
            if (!servletContext.controller) {
                resolve(new InterruptModel_1.default());
            }
            else if (typeof servletContext.action !== 'function') {
                logger.debug("Cannot find Controller from: " + servletContext.controllerName + "/" + servletContext.actionName);
                resolve(new InterruptModel_1.default());
            }
            else {
                return (new DispatcherServlet_1.default()).doService(servletContext).then(resolve, reject);
            }
        });
    };
    ControllerFactory.prototype.createController = function (servletContext) {
        var pathContext = RouteCollection_1.default.match(servletContext.request);
        var areaRegisterControllers = ControllerFactory.getAreaControllers(pathContext.area) || {};
        var controllerName = (pathContext.controllerName || '').toLowerCase();
        servletContext.Controller = pathContext.controller || areaRegisterControllers[controllerName];
        servletContext.controllerName = pathContext.controllerName;
        servletContext.controller = ControllerManagement_1.default.createController(servletContext);
        servletContext.action = ControllerManagement_1.default.creatAction(servletContext.controllerName, pathContext.action || pathContext.actionName);
        servletContext.actionName = pathContext.actionName;
        servletContext.params = pathContext.params || {};
        servletContext.request.pathVariables = servletContext.params;
        return servletContext;
    };
    ControllerFactory.prototype.handle = function (servletContext) {
        var runtime = { error: null };
        return this
            .executeController(servletContext)
            .then(function (model) {
            if (model instanceof InterruptModel_1.default) {
                servletContext.next();
            }
        })
            .catch(function (ex) {
            runtime.error = ex;
            servletContext.next(ex);
        });
    };
    return ControllerFactory;
}());
exports.default = ControllerFactory;
//# sourceMappingURL=ControllerFactory.js.map