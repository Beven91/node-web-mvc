"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ModelAndView = (function () {
    function ModelAndView(view, model) {
        this.view = view;
        this.model = model;
    }
    ModelAndView.prototype.isEmpty = function () {
        return this.view == null && this.model == null;
    };
    ModelAndView.prototype.wasCleared = function () {
        return this.cleared && this.isEmpty;
    };
    ModelAndView.prototype.clear = function () {
        this.cleared = true;
        this.view = null;
        this.model = null;
    };
    ModelAndView.prototype.addObject = function (name, data) {
        this.model = this.model || {};
        this.model[name] = data;
    };
    return ModelAndView;
}());
exports.default = ModelAndView;
//# sourceMappingURL=ModelAndView.js.map