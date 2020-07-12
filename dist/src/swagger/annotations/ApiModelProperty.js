"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = __importDefault(require("../openapi/index"));
function ApiModelProperty(options) {
    return function (target, name) {
        index_1.default.addModelProperty(options, target.constructor, name);
    };
}
exports.default = ApiModelProperty;
//# sourceMappingURL=ApiModelProperty.js.map