"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var busboy_1 = __importDefault(require("busboy"));
var MultipartFile_1 = __importDefault(require("../MultipartFile"));
var EntityTooLargeError_1 = __importDefault(require("../../../errors/EntityTooLargeError"));
var MultipartMessageConverter = (function () {
    function MultipartMessageConverter() {
    }
    MultipartMessageConverter.prototype.canRead = function (mediaType) {
        return mediaType.name === 'multipart/form-data';
    };
    MultipartMessageConverter.prototype.canWrite = function (mediaType) {
        return mediaType.name === 'multipart/form-data';
    };
    MultipartMessageConverter.prototype.createMultipartFile = function (form, fieldname, file, filename, encoding, mimetype) {
        return new Promise(function (resolve, reject) {
            var value = form[fieldname];
            if (value) {
                form[fieldname] = [
                    value,
                    new MultipartFile_1.default(filename, file, encoding, mimetype)
                ];
            }
            else {
                form[fieldname] = new MultipartFile_1.default(filename, file, encoding, mimetype);
            }
            file.on('limit', function () { return reject(new EntityTooLargeError_1.default()); });
            file.on('end', resolve);
        });
    };
    MultipartMessageConverter.prototype.read = function (servletContext, mediaType) {
        var _this = this;
        return new Promise(function (topResolve, topReject) {
            var promise = Promise.resolve();
            var form = {};
            var configurer = servletContext.configurer;
            var busboy = new busboy_1.default({
                headers: servletContext.request.headers,
                limits: {
                    fileSize: configurer.multipart.maxFileSize
                }
            });
            busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
                promise = promise.then(function () { return _this.createMultipartFile(form, fieldname, file, filename, encoding, mimetype); });
            });
            busboy.on('field', function (fieldname, val) {
                promise = promise.then(function () { return form[fieldname] = val; });
            });
            busboy.on('finish', function () { return promise.then(function () { return topResolve(form); }, topReject); });
            servletContext.request.pipe(busboy);
        });
    };
    MultipartMessageConverter.prototype.write = function (data, mediaType, servletContext) {
        return Promise.resolve();
    };
    return MultipartMessageConverter;
}());
exports.default = MultipartMessageConverter;
//# sourceMappingURL=MultipartMessageConverter.js.map