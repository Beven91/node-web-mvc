"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ControllerManagement_1 = __importDefault(require("../../ControllerManagement"));
function scopeAnnotation(scope) {
    return function (Controller) {
        var descriptor = ControllerManagement_1.default.getControllerDescriptor(Controller);
        descriptor.scope = scope;
    };
}
exports.default = scopeAnnotation;
//# sourceMappingURL=Scope.js.map