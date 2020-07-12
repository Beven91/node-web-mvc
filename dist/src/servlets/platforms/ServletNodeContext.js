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
var http_1 = __importDefault(require("http"));
var ServletContext_1 = __importDefault(require("../http/ServletContext"));
var WebAppConfigurer_1 = __importDefault(require("../WebAppConfigurer"));
var ServletNodeContext = (function (_super) {
    __extends(ServletNodeContext, _super);
    function ServletNodeContext() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ServletNodeContext.launch = function (callback) {
        var configurer = WebAppConfigurer_1.default.configurer;
        var port = configurer.port;
        var server = http_1.default.createServer(function (req, res) {
            Object.defineProperty(req, 'path', { value: req.url });
            callback(req, res, function (err) {
                if (err) {
                    console.error(err.stack || err);
                    res.writeHead(500).end('internal error');
                }
                else {
                    res.writeHead(404).end();
                }
            });
        });
        server.on('clientError', function (err, socket) {
            socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        });
        server.listen(port, function () {
            console.log("\n        -------------------------------------\n        ====> Start node-mvc\n        ====> Enviroment: development\n        ====> Listening: port " + port + "\n        ====> Url: http://localhost:" + port + "/swagger/index.html\n        -------------------------------------\n      ");
        });
        return function () {
        };
    };
    return ServletNodeContext;
}(ServletContext_1.default));
exports.default = ServletNodeContext;
//# sourceMappingURL=ServletNodeContext.js.map