"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var RouteCollection_1 = __importDefault(require("../../../routes/RouteCollection"));
var ControllerManagement_1 = __importDefault(require("../../../ControllerManagement"));
var RouteMapping_1 = __importDefault(require("../../../routes/RouteMapping"));
var Target_1 = __importDefault(require("../Target"));
var ElementType_1 = __importDefault(require("../annotation/ElementType"));
var RequestMapping = (function () {
    function RequestMapping(meta, value) {
        this.mapping = RouteMapping_1.default.create(value, null);
        var target = meta.target, name = meta.name, descriptor = meta.descriptor;
        switch (meta.elementType) {
            case ElementType_1.default.TYPE:
                requestMappingController(target, this.mapping);
                break;
            case ElementType_1.default.METHOD:
                requestMappingAction(target.constructor, name, descriptor, this.mapping);
                break;
        }
    }
    RequestMapping = __decorate([
        Target_1.default
    ], RequestMapping);
    return RequestMapping;
}());
exports.default = Target_1.default.install(RequestMapping);
function requestMappingController(target, mapping) {
    var descriptor = ControllerManagement_1.default.getControllerDescriptor(target);
    descriptor.mapping = RouteMapping_1.default.create(mapping, null);
}
function requestMappingAction(target, name, descriptor, mapping) {
    var action = ControllerManagement_1.default.getActionDescriptor(target, name);
    action.value = descriptor.value;
    action.mapping = mapping;
    RouteCollection_1.default.mapRule({
        match: function (req) {
            return mapping.match(req, target, descriptor.value, name);
        },
        action: action,
        controller: target,
    });
}
//# sourceMappingURL=RequestMapping.js.map