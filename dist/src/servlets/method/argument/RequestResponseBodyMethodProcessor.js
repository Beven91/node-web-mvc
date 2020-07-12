"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var MessageConverter_1 = __importDefault(require("../..//http/converts/MessageConverter"));
var RequestBody_1 = __importDefault(require("../../annotations/params/RequestBody"));
var RequestResponseBodyMethodProcessor = (function () {
    function RequestResponseBodyMethodProcessor() {
    }
    RequestResponseBodyMethodProcessor.prototype.supportsParameter = function (paramater, servletContext) {
        return paramater.hasParameterAnnotation(RequestBody_1.default);
    };
    RequestResponseBodyMethodProcessor.prototype.resolveArgument = function (parameter, servletContext) {
        return MessageConverter_1.default.read(servletContext);
    };
    return RequestResponseBodyMethodProcessor;
}());
exports.default = RequestResponseBodyMethodProcessor;
//# sourceMappingURL=RequestResponseBodyMethodProcessor.js.map