"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var AreaRegistrationContext_1 = __importDefault(require("./AreaRegistrationContext"));
var ControllerFactory_1 = __importDefault(require("./ControllerFactory"));
var logger = console;
var AreaRegistration = (function () {
    function AreaRegistration() {
    }
    AreaRegistration.getAllAreaRegistrations = function (areasRoot) {
        var registrations = [];
        if (!fs_1.default.existsSync(areasRoot)) {
            return [];
        }
        fs_1.default.readdirSync(areasRoot).forEach(function (name) {
            var file = path_1.default.resolve(areasRoot, name, 'areaRegistration.js');
            if (!fs_1.default.existsSync(file)) {
                return;
            }
            var maybeRegistration = require(file);
            if (maybeRegistration && maybeRegistration.prototype instanceof AreaRegistration) {
                maybeRegistration.areaDir = path_1.default.dirname(file);
                registrations.push(maybeRegistration);
            }
            else {
                logger.warn(file + " the module  exports is not a AreaRegistration ?\n check code: module.exports = XXXAreaRegistration ?");
            }
        });
        return registrations;
    };
    AreaRegistration.registerAllAreas = function (areasRoot) {
        var _this = this;
        var registrations = this.getAllAreaRegistrations(areasRoot);
        registrations.forEach(function (Registration) {
            var registration = new Registration();
            var controllerDir = path_1.default.join(Registration.areaDir, 'controllers');
            var registrationContext = new AreaRegistrationContext_1.default(registration.areaName);
            logger.info('Register area:');
            logger.info('AreaName: ' + registration.areaName);
            logger.info('AreaDir: ' + Registration.areaDir);
            _this.registerAreaViews(path_1.default.join(Registration.areaDir, 'views'));
            registration.registerArea(registrationContext);
            ControllerFactory_1.default.registerAreaControllers(registration.areaName, controllerDir);
        });
    };
    AreaRegistration.registerAreaViews = function (areasRoot) {
    };
    AreaRegistration.areaDir = '';
    return AreaRegistration;
}());
exports.default = AreaRegistration;
//# sourceMappingURL=AreaRegistration.js.map