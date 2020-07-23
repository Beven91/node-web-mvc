"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var createParam_1 = __importDefault(require("./createParam"));
var Target_1 = __importDefault(require("../Target"));
var PathVariable = (function () {
    function PathVariable(meta, options) {
        this.param = createParam_1.default(options, meta, 'path');
    }
    PathVariable = __decorate([
        Target_1.default
    ], PathVariable);
    return PathVariable;
}());
exports.default = Target_1.default.install(PathVariable);
//# sourceMappingURL=PathVariable.js.map