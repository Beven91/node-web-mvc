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
var stream_1 = require("stream");
var RequestMemoryStream = (function (_super) {
    __extends(RequestMemoryStream, _super);
    function RequestMemoryStream(request, handler) {
        var _this = _super.call(this) || this;
        _this.readBuffers = Buffer.from([]);
        request.nativeRequest.pipe(_this);
        _this.on('finish', function () {
            handler(_this.readBuffers);
            _this.readBuffers = null;
        });
        return _this;
    }
    RequestMemoryStream.prototype._write = function (chunk, encoding, cb) {
        this.readBuffers = Buffer.concat([this.readBuffers, chunk]);
        cb();
    };
    return RequestMemoryStream;
}(stream_1.Writable));
exports.default = RequestMemoryStream;
//# sourceMappingURL=RequestMemoryStream.js.map