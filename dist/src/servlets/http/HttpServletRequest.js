"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var querystring_1 = __importDefault(require("querystring"));
var MediaType_1 = __importDefault(require("./MediaType"));
var HttpMethod_1 = __importDefault(require("./HttpMethod"));
var HttpServletRequest = (function () {
    function HttpServletRequest(request, servletContext) {
        var protocol = request.connection.encrypted ? 'https' : 'http';
        var url = new URL(request.url, protocol + "://" + request.headers.host);
        this.headers = request.headers;
        this.method = HttpMethod_1.default[(request.method).toUpperCase()];
        this.protocol = protocol;
        this.request = request;
        this.query = querystring_1.default.parse(url.search.slice(1));
        this.host = url.hostname;
        this.port = url.port;
        this.path = url.pathname;
        this.mediaType = new MediaType_1.default(this.headers['content-type']);
        this.servletContext = servletContext;
        this._cookies = {};
    }
    Object.defineProperty(HttpServletRequest.prototype, "cookies", {
        get: function () {
            return this._cookies;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HttpServletRequest.prototype, "nativeRequest", {
        get: function () {
            return this.request;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HttpServletRequest.prototype, "fdomain", {
        get: function () {
            var port = (this.port ? ':' + this.port : this.port);
            return this.protocol + '//' + this.host + port;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HttpServletRequest.prototype, "url", {
        get: function () {
            return this.nativeRequest.url;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HttpServletRequest.prototype, "baseUrl", {
        get: function () {
            return this.fdomain + this.path;
        },
        enumerable: false,
        configurable: true
    });
    HttpServletRequest.prototype.pipe = function (writeStream, options) {
        this.nativeRequest.pipe(writeStream, options);
    };
    return HttpServletRequest;
}());
exports.default = HttpServletRequest;
//# sourceMappingURL=HttpServletRequest.js.map