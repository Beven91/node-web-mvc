"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ControllerManagement_1 = __importDefault(require("../../ControllerManagement"));
function default_1() {
    return function ExceptionHandler(target, name, descriptor) {
        var controllerDescriptor = ControllerManagement_1.default.getControllerDescriptor(target.constructor);
        controllerDescriptor.exceptionHandler = descriptor.value;
    };
}
exports.default = default_1;
//# sourceMappingURL=ExceptionHandler.js.map