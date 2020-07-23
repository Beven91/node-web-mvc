"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ElementType_1 = __importStar(require("./ElementType"));
var Javascript_1 = __importDefault(require("../../../interface/Javascript"));
var runtimeAnnotations = [];
var RuntimeAnnotation = (function () {
    function RuntimeAnnotation() {
    }
    Object.defineProperty(RuntimeAnnotation.prototype, "ctor", {
        get: function () {
            switch (this.elementType) {
                case ElementType_1.default.TYPE:
                    return this.target;
                default:
                    return this.target.constructor;
            }
        },
        enumerable: false,
        configurable: true
    });
    RuntimeAnnotation.getClassAnnotations = function (ctor) {
        return runtimeAnnotations.filter(function (m) { return m.target = ctor || m.target.constructor === ctor; });
    };
    RuntimeAnnotation.getClassAnnotation = function (ctor, type) {
        var isAnnotation = function (m) { return m.target === ctor && m.nativeAnnotation instanceof type; };
        return runtimeAnnotations.find(isAnnotation);
    };
    RuntimeAnnotation.getMethodAnnotations = function (ctor, method) {
        var isAnnotation = function (s) { return s.elementType === ElementType_1.default.METHOD && s.name === method; };
        return this.getClassAnnotations(ctor).filter(isAnnotation);
    };
    RuntimeAnnotation.getMethodParamAnnotations = function (ctor, method) {
        var isAnnotation = function (s) { return s.elementType === ElementType_1.default.PARAMETER && s.name === method; };
        return this.getClassAnnotations(ctor).filter(isAnnotation);
    };
    RuntimeAnnotation.getMethodParamAnnotation = function (ctor, method, paramName) {
        return this.getMethodAnnotations(ctor, method).find(function (s) { return s.paramName === paramName; });
    };
    RuntimeAnnotation.create = function (options) {
        var meta = options.meta, types = options.types, RealAnnotation = options.ctor;
        var elementType = ElementType_1.checkAnnotation(types, meta, RealAnnotation.name);
        var runtimeAnnotation = new RuntimeAnnotation();
        runtimeAnnotation.elementType = elementType;
        var target = meta[0], name = meta[1], descritpor = meta[2];
        switch (elementType) {
            case ElementType_1.default.TYPE:
                runtimeAnnotation.target = target;
                break;
            case ElementType_1.default.METHOD:
                runtimeAnnotation.target = target;
                runtimeAnnotation.name = name;
                runtimeAnnotation.descriptor = descritpor;
                break;
            case ElementType_1.default.PARAMETER:
                {
                    var parameters = Javascript_1.default.resolveParameters(target[name]);
                    runtimeAnnotation.target = target;
                    runtimeAnnotation.name = name;
                    runtimeAnnotation.paramIndex = descritpor;
                    runtimeAnnotation.paramName = parameters[runtimeAnnotation.paramIndex];
                }
                break;
        }
        runtimeAnnotation.nativeAnnotation = new (RealAnnotation.bind.apply(RealAnnotation, __spreadArrays([void 0, runtimeAnnotation], options.options)))();
        runtimeAnnotations.push(runtimeAnnotation);
        return runtimeAnnotation;
    };
    return RuntimeAnnotation;
}());
exports.default = RuntimeAnnotation;
//# sourceMappingURL=RuntimeAnnotation.js.map