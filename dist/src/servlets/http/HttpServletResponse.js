"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HttpServletResponse = (function () {
    function HttpServletResponse(response, servletContext) {
        this.nativeResponse = response;
        this.servletContext = servletContext;
    }
    Object.defineProperty(HttpServletResponse.prototype, "request", {
        get: function () {
            return this.servletContext.request;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HttpServletResponse.prototype, "headersSent", {
        get: function () {
            return this.nativeResponse.headersSent;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HttpServletResponse.prototype, "statusCode", {
        get: function () {
            return this.nativeResponse.statusCode;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HttpServletResponse.prototype, "statusMessage", {
        get: function () {
            return this.nativeResponse.statusMessage;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HttpServletResponse.prototype, "nativeContentType", {
        get: function () {
            return this.nativeResponse.getHeader('content-type');
        },
        enumerable: false,
        configurable: true
    });
    HttpServletResponse.prototype.setHeader = function (name, value) {
        this.nativeResponse.setHeader(name, value);
    };
    HttpServletResponse.prototype.setStatus = function (status, statusMessage) {
        this.nativeResponse.writeHead(status, statusMessage);
        return this;
    };
    HttpServletResponse.prototype.removeHeader = function (name) {
        this.nativeResponse.removeHeader(name);
    };
    HttpServletResponse.prototype.write = function (chunk, callback, encoding) {
        this.nativeResponse.write(chunk === undefined ? '' : chunk, encoding || 'utf-8', callback);
    };
    HttpServletResponse.prototype.end = function (data, encoding, callback) {
        this.nativeResponse.end(data, encoding, callback);
    };
    HttpServletResponse.prototype.sendRedirect = function (url, status) {
        if (status === void 0) { status = 302; }
        var request = this.request;
        var isAbs = /^(http|https):/.test(url);
        var isRoot = /^\//.test(url);
        var redirectUrl = isAbs ? url : isRoot ? request.fdomain + '/' + url : request.baseUrl + url;
        this.nativeResponse.writeHead(status, { 'Location': redirectUrl });
    };
    return HttpServletResponse;
}());
exports.default = HttpServletResponse;
//# sourceMappingURL=HttpServletResponse.js.map