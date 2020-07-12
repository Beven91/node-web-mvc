"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var RouteCollection_1 = __importDefault(require("../../../routes/RouteCollection"));
var ControllerManagement_1 = __importDefault(require("../../../ControllerManagement"));
var RouteMapping_1 = __importDefault(require("../../../routes/RouteMapping"));
function requestMappingAnnotation(value) {
    return function (target, name, descriptor) {
        var mapping = RouteMapping_1.default.create(value, null);
        if (arguments.length > 1) {
            return requestMappingAction(target.constructor, name, descriptor, mapping);
        }
        else {
            return requestMappingController(target, mapping);
        }
    };
}
exports.default = requestMappingAnnotation;
function requestMappingController(target, mapping) {
    var descriptor = ControllerManagement_1.default.getControllerDescriptor(target);
    descriptor.mapping = RouteMapping_1.default.create(mapping, null);
}
function requestMappingAction(target, name, descriptor, mapping) {
    var action = ControllerManagement_1.default.getActionDescriptor(target, name);
    action.value = descriptor.value;
    action.mapping = mapping;
    RouteCollection_1.default.mapRule({
        match: function (req) { return mapping.match(req, target, descriptor.value, name); },
        action: action,
        controller: target,
    });
}
//# sourceMappingURL=RequestMapping.js.map