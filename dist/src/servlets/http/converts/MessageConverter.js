"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var JsonMessageConverter_1 = __importDefault(require("./JsonMessageConverter"));
var DefaultMessageConverter_1 = __importDefault(require("./DefaultMessageConverter"));
var MultipartMessageConverter_1 = __importDefault(require("./MultipartMessageConverter"));
var UrlencodedMessageConverter_1 = __importDefault(require("./UrlencodedMessageConverter"));
var EntityTooLargeError_1 = __importDefault(require("../../../errors/EntityTooLargeError"));
var registerConverters = [
    new JsonMessageConverter_1.default(),
    new UrlencodedMessageConverter_1.default(),
    new MultipartMessageConverter_1.default(),
    new DefaultMessageConverter_1.default()
];
var MessageConverter = (function () {
    function MessageConverter() {
    }
    MessageConverter.addMessageConverters = function (converter) {
        registerConverters.unshift(converter);
    };
    MessageConverter.read = function (servletContext) {
        var request = servletContext.request;
        var configurer = servletContext.configurer;
        var length = parseFloat(request.headers['content-length']);
        if (length > configurer.multipart.maxRequestSize) {
            return Promise.reject(new EntityTooLargeError_1.default());
        }
        if (request.body) {
            return Promise.resolve(request.body);
        }
        var mediaType = servletContext.request.mediaType;
        var converter = registerConverters.find(function (converter) { return converter.canRead(mediaType); });
        return request.body = Promise.resolve(converter.read(servletContext, mediaType));
    };
    MessageConverter.write = function (data, mediaType, servletContext) {
        var converter = registerConverters.find(function (converter) { return converter.canWrite(mediaType); });
        return Promise.resolve(converter.write(data, mediaType, servletContext));
    };
    return MessageConverter;
}());
exports.default = MessageConverter;
//# sourceMappingURL=MessageConverter.js.map