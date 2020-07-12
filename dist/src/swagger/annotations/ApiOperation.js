"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = __importDefault(require("../openapi/index"));
function ApiOperation(operation) {
    return function (target, name, descriptor) {
        index_1.default.addOperation(operation, target.constructor, name);
    };
}
exports.default = ApiOperation;
//# sourceMappingURL=ApiOperation.js.map