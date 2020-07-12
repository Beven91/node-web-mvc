"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServletResponse = exports.ServletRequest = void 0;
var createParam_1 = __importDefault(require("./createParam"));
function ServletParam(type, name) {
    var options = { value: name, paramType: type || name, required: true };
    return function (target, name, index) {
        var newIndex = isNaN(index) ? -1 : index;
        return createParam_1.default(target, name, options, newIndex, type, ServletParam);
    };
}
exports.default = ServletParam;
function ServletRequest(target, name, index) {
    ServletParam('request')(target, name, index);
}
exports.ServletRequest = ServletRequest;
function ServletResponse(target, name, index) {
    ServletParam('response')(target, name, index);
}
exports.ServletResponse = ServletResponse;
//# sourceMappingURL=ServletParam.js.map