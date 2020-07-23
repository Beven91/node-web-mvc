"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAnnotation = exports.reflectAnnotationType = void 0;
var AnnotationElementTypeError_1 = __importDefault(require("../../../errors/AnnotationElementTypeError"));
var ElementType;
(function (ElementType) {
    ElementType["TYPE"] = "TYPE";
    ElementType["METHOD"] = "METHOD";
    ElementType["PARAMETER"] = "PARAMETER";
    ElementType["PROPERTY"] = "PROPERTY";
})(ElementType || (ElementType = {}));
function reflectAnnotationType(options) {
    if (!options || options.length < 0 || options.length > 3 || !options[0]) {
        return 'UNKNOW';
    }
    var length = options.length;
    var target = options[0], name = options[1], descritptor = options[2];
    var hasContructor = typeof target.constructor === 'function';
    var isAnnotation = hasContructor && (target[name] === target.constructor.prototype[name]);
    if (length === 1 && typeof target === 'function') {
        return ElementType.TYPE;
    }
    else if (length === 3 && isAnnotation && descritptor === undefined) {
        return ElementType.PROPERTY;
    }
    else if (length === 3 && isAnnotation) {
        var isNumber = typeof descritptor === 'number';
        return isNumber ? ElementType.PARAMETER : ElementType.METHOD;
    }
    return 'UNKNOW';
}
exports.reflectAnnotationType = reflectAnnotationType;
function checkAnnotation(types, options, name) {
    var elementType = reflectAnnotationType(options);
    if (types.length > 0 && types.indexOf(elementType) < 0) {
        throw new AnnotationElementTypeError_1.default(name, types);
    }
    return elementType;
}
exports.checkAnnotation = checkAnnotation;
exports.default = ElementType;
//# sourceMappingURL=ElementType.js.map