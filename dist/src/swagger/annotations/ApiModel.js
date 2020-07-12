"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = __importDefault(require("../openapi/index"));
function ApiModel(options) {
    return function (model) {
        index_1.default.addModel(options, model);
    };
}
exports.default = ApiModel;
//# sourceMappingURL=ApiModel.js.map