"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var bytes_1 = __importDefault(require("bytes"));
var openapi_1 = __importDefault(require("../swagger/openapi"));
var HandlerInteceptorRegistry_1 = __importDefault(require("./interceptor/HandlerInteceptorRegistry"));
var MessageConverter_1 = __importDefault(require("./http/converts/MessageConverter"));
var ArgumentsResolvers_1 = __importDefault(require("./method/argument/ArgumentsResolvers"));
var ViewResolverRegistry_1 = __importDefault(require("./view/ViewResolverRegistry"));
var hot_1 = __importDefault(require("../hot"));
var runtime = {
    configurer: null
};
var WebAppConfigurer = (function () {
    function WebAppConfigurer() {
        this.options = {
            mode: 'node',
            cwd: path_1.default.resolve('controllers'),
        };
    }
    Object.defineProperty(WebAppConfigurer, "configurer", {
        get: function () {
            if (!runtime.configurer) {
                runtime.configurer = new WebAppConfigurer();
            }
            return runtime.configurer;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebAppConfigurer.prototype, "cwd", {
        get: function () {
            return this.options.cwd;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebAppConfigurer.prototype, "mode", {
        get: function () {
            return this.options.mode;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebAppConfigurer.prototype, "port", {
        get: function () {
            return this.options.port;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebAppConfigurer.prototype, "contextPath", {
        get: function () {
            return this.options.base;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebAppConfigurer.prototype, "multipart", {
        get: function () {
            return this.options.multipart;
        },
        enumerable: false,
        configurable: true
    });
    WebAppConfigurer.prototype.sizeFormat = function (size, dv) {
        size = typeof size === 'string' && size ? bytes_1.default.parse(size) : size;
        return size == '' || isNaN(size) ? dv : size;
    };
    WebAppConfigurer.prototype.launchSpringMvc = function (dir) {
        var files = fs_1.default.readdirSync(dir).filter(function (name) {
            var ext = path_1.default.extname(name);
            return ext === '.js' || ext === '.ts';
        });
        files.forEach(function (name) {
            require(path_1.default.join(dir, name));
        });
    };
    WebAppConfigurer.prototype.initialize = function (options) {
        if (options.hot) {
            hot_1.default.run(options.hot);
        }
        if (options.addInterceptors) {
            options.addInterceptors(HandlerInteceptorRegistry_1.default);
        }
        if (options.addMessageConverters) {
            options.addMessageConverters(MessageConverter_1.default);
        }
        if (options.addArgumentResolvers) {
            options.addArgumentResolvers(ArgumentsResolvers_1.default);
        }
        if (options.addViewResolvers) {
            options.addViewResolvers(ViewResolverRegistry_1.default);
        }
        if (options.swagger !== false) {
            openapi_1.default.initialize();
        }
        this.options = options;
        this.launchSpringMvc(options.cwd);
        this.options.multipart = options.multipart || { maxFileSize: '', maxRequestSize: '' };
        this.multipart.maxFileSize = this.sizeFormat(this.multipart.maxFileSize, bytes_1.default.parse('500kb'));
        this.multipart.maxRequestSize = this.sizeFormat(this.multipart.maxRequestSize, bytes_1.default.parse('500kb'));
        return this;
    };
    return WebAppConfigurer;
}());
exports.default = WebAppConfigurer;
hot_1.default.create(module).accept(function () {
});
//# sourceMappingURL=WebAppConfigurer.js.map