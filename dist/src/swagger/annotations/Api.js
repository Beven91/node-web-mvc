"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = __importDefault(require("../openapi/index"));
function Api(options) {
    return function (controller) {
        index_1.default.addApi(options, controller);
    };
}
exports.default = Api;
//# sourceMappingURL=Api.js.map