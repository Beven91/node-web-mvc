"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Javascript_1 = __importDefault(require("./interface/Javascript"));
var RouteMapping_1 = __importDefault(require("./routes/RouteMapping"));
var declare_1 = require("./interface/declare");
var hot_1 = __importDefault(require("./hot"));
var runtime = {
    scopeControllers: {
        singleton: [],
        'prototype': null
    },
    allControllerDescriptors: ([]),
    controllerAdviceInstance: null,
};
var ControllerManagement = (function () {
    function ControllerManagement() {
    }
    Object.defineProperty(ControllerManagement, "controllerAdviceInstance", {
        get: function () {
            return runtime.controllerAdviceInstance;
        },
        set: function (value) {
            var instance = runtime.controllerAdviceInstance;
            if (instance) {
                throw new Error('There has multiple @ControllerAdvice @' + instance.constructor.name + ' @' + value.constructor.name);
            }
            runtime.controllerAdviceInstance = value;
        },
        enumerable: false,
        configurable: true
    });
    ControllerManagement.getControllerDescriptor = function (ctor) {
        var allControllerDescriptors = runtime.allControllerDescriptors;
        var controllerDescriptors = allControllerDescriptors.find(function (attr) { return attr.ctor === ctor; });
        if (!controllerDescriptors) {
            controllerDescriptors = { ctor: ctor, actions: {} };
            allControllerDescriptors.push(controllerDescriptors);
        }
        return controllerDescriptors;
    };
    ControllerManagement.getActionDescriptor = function (ctor, name) {
        var descriptor = ControllerManagement.getControllerDescriptor(ctor);
        var actions = descriptor.actions;
        if (!actions[name]) {
            actions[name] = new declare_1.ActionDescriptors();
        }
        var action = actions[name];
        if (!action.params) {
            action.params = [];
        }
        return action;
    };
    ControllerManagement.addScopeController = function (scope, controller) {
        var container = runtime.scopeControllers[scope];
        if (container) {
            var addable = !container.find(function (instance) { return instance === controller; });
            addable ? container.push(controller) : undefined;
        }
    };
    ControllerManagement.createController = function (servletContext) {
        var Controller = servletContext.Controller;
        if (typeof Controller !== 'function') {
            return null;
        }
        var descriptor = this.getControllerDescriptor(Controller);
        var scope = descriptor.scope || 'singleton';
        var container = runtime.scopeControllers[scope] || [];
        var controller = container.find(function (instance) { return instance.constructor === Controller; });
        if (!controller) {
            controller = new Controller();
            this.addScopeController(scope, controller);
        }
        return controller;
    };
    ControllerManagement.creatAction = function (controller, actionName) {
        if (!controller) {
            return null;
        }
        else if (typeof actionName === 'function') {
            return actionName;
        }
        else {
            var actions = this.initializeControllerActions(controller);
            return (actions[actionName] || {}).value;
        }
    };
    ControllerManagement.initializeControllerActions = function (controller) {
        var Controller = controller.constructor;
        var descriptor = ControllerManagement.getControllerDescriptor(Controller);
        if (!descriptor.actions) {
            var actions_1 = descriptor.actions = {};
            var actionNames = Reflect.ownKeys(controller.__proto__).filter(function (key) { return !Javascript_1.default.protoKeys[key]; });
            actionNames.forEach(function (key) {
                actions_1[key] = {
                    value: Controller.prototype[key],
                    mapping: new RouteMapping_1.default(Controller.name + '/' + key, '', null, null, null, null),
                };
            });
        }
        return descriptor.actions;
    };
    return ControllerManagement;
}());
exports.default = ControllerManagement;
hot_1.default.create(module).preend(function (old) {
    var controllerClass = old.exports.default || old.exports;
    if (typeof controllerClass !== 'function') {
        return;
    }
    var descriptors = runtime.allControllerDescriptors;
    var findItem = descriptors.find(function (s) { return s.ctor === controllerClass; });
    var index = descriptors.indexOf(findItem);
    var scope = runtime.scopeControllers;
    if (index > -1) {
        descriptors.splice(index, 1);
    }
    Object.keys(scope).forEach(function (k) {
        var controllers = scope[k];
        if (controllers) {
            scope[k] = controllers.filter(function (c) { return !(c instanceof controllerClass); });
        }
    });
    if (runtime.controllerAdviceInstance instanceof controllerClass) {
        runtime.controllerAdviceInstance = null;
    }
});
//# sourceMappingURL=ControllerManagement.js.map