"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MediaType = (function () {
    function MediaType(mediaType) {
        var _this = this;
        var parts = (mediaType || '').split(';');
        this.name = parts.shift();
        this.parameters = {};
        parts.forEach(function (part) {
            var kv = part.split('=');
            _this.parameters[kv[0]] = kv[1];
        });
    }
    MediaType.prototype.toString = function () {
        var _this = this;
        var keys = Object.keys(this.parameters);
        return this.name + ";" + keys.map(function (k) { return k + "=" + _this.parameters[k]; });
    };
    return MediaType;
}());
exports.default = MediaType;
//# sourceMappingURL=MediaType.js.map