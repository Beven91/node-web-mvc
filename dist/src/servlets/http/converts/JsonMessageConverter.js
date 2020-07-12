"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var body_parser_1 = __importDefault(require("body-parser"));
var JsonMessageConverter = (function () {
    function JsonMessageConverter() {
    }
    JsonMessageConverter.prototype.canRead = function (mediaType) {
        return mediaType.name === 'application/json';
    };
    JsonMessageConverter.prototype.canWrite = function (mediaType) {
        return mediaType.name === 'application/json';
    };
    JsonMessageConverter.prototype.read = function (servletContext, mediaType) {
        return new Promise(function (resolve, reject) {
            var request = servletContext.request, response = servletContext.response, configurer = servletContext.configurer;
            body_parser_1.default.json()(request.nativeRequest, response.nativeResponse, function (err) {
                err ? reject(err) : resolve(request.nativeRequest.body);
            });
        });
    };
    JsonMessageConverter.prototype.write = function (data, mediaType, servletContext) {
        return new Promise(function (resolve) {
            var out = typeof data === 'string' ? data : JSON.stringify(data);
            servletContext.response.write(out, resolve);
        });
    };
    return JsonMessageConverter;
}());
exports.default = JsonMessageConverter;
//# sourceMappingURL=JsonMessageConverter.js.map