"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parameterReturnable = void 0;
var AnnotationOptions_1 = __importDefault(require("./annotation/AnnotationOptions"));
var RuntimeAnnotation_1 = __importDefault(require("./annotation/RuntimeAnnotation"));
var ElementType_1 = require("./annotation/ElementType");
var elementTypes = Symbol('elementTypes');
exports.parameterReturnable = Symbol('parameterReturnable');
function Target(types) {
    if (types instanceof Array) {
        (function (target) { return target[elementTypes] = types; });
    }
}
exports.default = Target;
Target.install = function (target) {
    var decorator = function (a, b, c) {
        var args = Array.prototype.slice.call(arguments);
        var runtime = new AnnotationOptions_1.default(target, args);
        var elementType = ElementType_1.reflectAnnotationType(args);
        if (elementType === 'UNKNOW') {
            return function () {
                var params = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    params[_i] = arguments[_i];
                }
                runtime.options = runtime.meta;
                runtime.meta = params;
                if (params[0] === exports.parameterReturnable) {
                    runtime.meta = params[1](runtime.options);
                    return createAnnotation(runtime);
                }
                createAnnotation(runtime);
            };
        }
        runtime.options = [];
        createAnnotation(runtime);
    };
    decorator.Annotation = target;
    Object.defineProperty(decorator, 'name', { value: target.name });
    return decorator;
};
function createAnnotation(runtime) {
    var target = runtime.meta[0];
    runtime.types = target[elementTypes] || target.constructor[elementTypes] || [];
    return RuntimeAnnotation_1.default.create(runtime);
}
//# sourceMappingURL=Target.js.map