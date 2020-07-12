"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DefaultMessageConverter = (function () {
    function DefaultMessageConverter() {
    }
    DefaultMessageConverter.prototype.canRead = function (mediaType) {
        return true;
    };
    DefaultMessageConverter.prototype.canWrite = function (mediaType) {
        return true;
    };
    DefaultMessageConverter.prototype.read = function (servletContext, mediaType) {
        return null;
    };
    DefaultMessageConverter.prototype.write = function (data, mediaType, servletContext) {
        return new Promise(function (resolve) {
            if (data instanceof Buffer || typeof data === 'string') {
                servletContext.response.write(data, resolve);
            }
            else {
                servletContext.response.write(JSON.stringify(data), resolve);
            }
        });
    };
    return DefaultMessageConverter;
}());
exports.default = DefaultMessageConverter;
//# sourceMappingURL=DefaultMessageConverter.js.map