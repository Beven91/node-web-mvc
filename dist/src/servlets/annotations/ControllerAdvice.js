"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ControllerManagement_1 = __importDefault(require("../../ControllerManagement"));
function ControllerAdvice(ControllerAdivce) {
    ControllerManagement_1.default.controllerAdviceInstance = new ControllerAdivce();
}
exports.default = ControllerAdvice;
//# sourceMappingURL=ControllerAdvice.js.map