"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = __importDefault(require("../openapi/index"));
var MultipartFile_1 = __importDefault(require("../../servlets/http/MultipartFile"));
var Target_1 = require("../../servlets/annotations/Target");
var Javascript_1 = __importDefault(require("../../interface/Javascript"));
function ApiImplicitParams(params) {
    return function (target, name, descriptor) {
        var parameters = Javascript_1.default.resolveParameters(target[name]);
        params = params.map(function (param) {
            if (typeof param === 'function') {
                var decorator = param;
                var annotation = decorator(Target_1.parameterReturnable, function (options) {
                    var data = options[0];
                    var paramIndex = parameters.indexOf(data.value);
                    return [target, name, paramIndex];
                });
                var options = annotation ? annotation.nativeAnnotation.param : null;
                if (!annotation || !options) {
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