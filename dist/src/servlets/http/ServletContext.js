"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var HttpServletRequest_1 = __importDefault(require("./HttpServletRequest"));
var HttpServletResponse_1 = __importDefault(require("./HttpServletResponse"));
var ServletContext = (function () {
    function ServletContext(configurer, request, response, next) {
        var _this = this;
        this.request = new HttpServletRequest_1.default(request, this);
        this.response = new HttpServletResponse_1.default(response, this);
        this.configurer = configurer;
        this.next = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            next.apply(void 0, params);
            _this.isNextInvoked = true;
        };
        this.forwardStacks = [];
        this.Controller = null;
        this.params = ({});
    }
    ServletContext.launch = function (callback) {
        return function (request, response, next) { return callback(request, response, next); };
    };
    return ServletContext;
}());
exports.default = ServletContext;
//# sourceMappingURL=ServletContext.js.map