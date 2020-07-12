"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = __importDefault(require("../openapi/index"));
var MultipartFile_1 = __importDefault(require("../../servlets/http/MultipartFile"));
function ApiImplicitParams(params) {
    return function (target, name, descriptor) {
        params = params.map(function (param) {
            if (typeof param === 'function') {
                var fun = param;
                var options = fun(target, name, descriptor, true);
                if (!options) {
                    return null;
                }
                var dataType = options.dataType || { name: undefined };
                if (dataType === MultipartFile_1.default) {
                    dataType = { name: 'file' };
                }
                return {
                    name: options.value,
                    value: options.desc,
                    required: options.required,
                    paramType: options.paramType,
                    dataType: dataType.name,
                };
            }
            return param;
        });
        index_1.default.addOperationParams(params, target.constructor, name);
    };
}
exports.default = ApiImplicitParams;
//# sourceMappingURL=ApiImplicitParams.js.map