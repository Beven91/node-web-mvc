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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ServletContext_1 = __importDefault(require("../http/ServletContext"));
var ServletExpressContext = (function (_super) {
    __extends(ServletExpressContext, _super);
    function ServletExpressContext() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ServletExpressContext.launch = function (callback) {
        return function (request, response, next) {
            callback(request, response, next);
        };
    };
    return ServletExpressContext;
}(ServletContext_1.default));
exports.default = ServletExpressContext;
//# sourceMappingURL=ServletExpressContext.js.map