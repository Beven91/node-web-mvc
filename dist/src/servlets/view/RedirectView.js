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
var View_1 = __importDefault(require("./View"));
var RedirectView = (function (_super) {
    __extends(RedirectView, _super);
    function RedirectView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RedirectView.prototype.render = function (model, request, response) {
        response.sendRedirect(this.url, 302);
        return null;
    };
    return RedirectView;
}(View_1.default));
exports.default = RedirectView;
//# sourceMappingURL=RedirectView.js.map