"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ControllerManagement_1 = __importDefault(require("../../../ControllerManagement"));
var MethodParameter_1 = __importDefault(require("../../../interface/MethodParameter"));
var Javascript_1 = __importDefault(require("../../../interface/Javascript"));
function default_1(options, meta, type) {
    var isString = typeof options === 'string';
    options = ((isString ? { value: options } : options) || {});
    var target = meta.target, paramIndex = meta.paramIndex, name = meta.name;
    var handler = target[name];
    var parameters = Javascript_1.default.resolveParameters(handler);
    options.name = options.name || parameters[paramIndex];
    options.value = options.value || options.name;
    var action = ControllerManagement_1.default.getActionDescriptor(target.constructor, name);
    var param = new MethodParameter_1.default(options, type, meta);
    action.params.push(param);
    return param;
}
exports.default = default_1;
//# sourceMappingURL=createParam.js.map