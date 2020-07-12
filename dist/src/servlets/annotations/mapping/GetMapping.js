"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var RequestMapping_1 = __importDefault(require("./RequestMapping"));
var RouteMapping_1 = __importDefault(require("../../../routes/RouteMapping"));
function default_1(value) {
    return RequestMapping_1.default(RouteMapping_1.default.create(value, 'GET'));
}
exports.default = default_1;
//# sourceMappingURL=GetMapping.js.map