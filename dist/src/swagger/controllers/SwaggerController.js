"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var RequestMapping_1 = __importDefault(require("../../servlets/annotations/mapping/RequestMapping"));
var ServletParam_1 = require("../../servlets/annotations/params/ServletParam");
var index_1 = __importDefault(require("../openapi/index"));
var producers = {
    '.js': 'text/javascript',
    '.html': 'text/html',
    '.css': 'text/css'
};
var SwaggerController = (function () {
    function SwaggerController() {
    }
    SwaggerController.prototype.openapi = function () {
        return index_1.default.build();
    };
    SwaggerController.prototype.static = function (request, response) {
        var name = request.path.split('/swagger/').slice(1).join('');
        var view = name || 'index.html';
        var file = path_1.default.join(__dirname, '../swagger-ui', view);
        var ext = path_1.default.extname(file);
        if (!fs_1.default.existsSync(file)) {
            return;
        }
        if (producers[ext]) {
            response.setHeader('Content-Type', producers[ext]);
        }
        return fs_1.default.readFileSync(file);
    };
    __decorate([
        RequestMapping_1.default({ value: '/swagger/openapi.json', produces: 'application/json' })
    ], SwaggerController.prototype, "openapi", null);
    __decorate([
        RequestMapping_1.default('/swagger/(.*)'),
        __param(0, ServletParam_1.ServletRequest), __param(1, ServletParam_1.ServletResponse)
    ], SwaggerController.prototype, "static", null);
    return SwaggerController;
}());
exports.default = SwaggerController;
//# sourceMappingURL=SwaggerController.js.map