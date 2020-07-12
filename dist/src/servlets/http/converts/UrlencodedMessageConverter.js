"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var body_parser_1 = __importDefault(require("body-parser"));
var UrlencodedMessageConverter = (function () {
    function UrlencodedMessageConverter() {
    }
    UrlencodedMessageConverter.prototype.canRead = function (mediaType) {
        return mediaType.name === 'application/x-www-form-urlencoded';
    };
    UrlencodedMessageConverter.prototype.canWrite = function (mediaType) {
        return mediaType.name === 'application/x-www-form-urlencoded';
    };
    UrlencodedMessageConverter.prototype.read = function (servletContext, mediaType) {
        return new Promise(function (resolve, reject) {
            var request = servletContext.request, response = servletContext.response;
            body_parser_1.default.urlencoded()(request.nativeRequest, response.nativeResponse, function (err) {
                err ? reject(err) : resolve(request.nativeRequest.body);
            });
        });
    };
    UrlencodedMessageConverter.prototype.write = function (data, mediaType, servletContext) {
        return Promise.resolve();
    };
    return UrlencodedMessageConverter;
}());
exports.default = UrlencodedMessageConverter;
//# sourceMappingURL=UrlencodedMessageConverter.js.map