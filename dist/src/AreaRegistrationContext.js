"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var RouteCollection_1 = __importDefault(require("./routes/RouteCollection"));
var AreaRegistractionContext = (function () {
    function AreaRegistractionContext(areaName) {
        this.areaName = areaName;
    }
    AreaRegistractionContext.prototype.mapRoute = function (exp, options) {
        options = options || { controller: '', action: '' };
        options.area = this.areaName;
        RouteCollection_1.default.mapRoute(exp, options);
    };
    return AreaRegistractionContext;
}());
exports.default = AreaRegistractionContext;
//# sourceMappingURL=AreaRegistrationContext.js.map