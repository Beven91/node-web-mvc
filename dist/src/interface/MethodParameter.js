"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MethodParameterOptions = void 0;
var MethodParameterOptions = (function () {
    function MethodParameterOptions() {
    }
    return MethodParameterOptions;
}());
exports.MethodParameterOptions = MethodParameterOptions;
var MethodParameter = (function (_super) {
    __extends(MethodParameter, _super);
    function MethodParameter(options, paramType, annotation) {
        var _this = _super.call(this) || this;
        if (options instanceof MethodParameter) {
            return options;
        }
        else if (typeof options === 'string') {
            _this.value = options;
        }
        else if (options) {
            _this.value = options.value;
            _this.desc = options.desc;
            _this.required = options.required;
            _this.name = options.name;
            _this.dataType = options.dataType;
            _this.defaultValue = options.defaultValue;
            _this.paramType = options.paramType;
        }
        _this.annotations = [annotation];
        _this.paramType = _this.paramType || paramType;
        return _this;
    }
    MethodParameter.prototype.hasParameterAnnotation = function (annotation) {
        return !!this.annotations.find(function (a) { return a === annotation; });
    };
    return MethodParameter;
}(MethodParameterOptions));
exports.default = MethodParameter;
//# sourceMappingURL=MethodParameter.js.map