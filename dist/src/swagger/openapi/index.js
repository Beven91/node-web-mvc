"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var RouteCollection_1 = __importDefault(require("../../routes/RouteCollection"));
var ControllerManagement_1 = __importDefault(require("../../ControllerManagement"));
var hot_1 = __importDefault(require("../../hot"));
var pkg = require(path_1.default.resolve('package.json'));
var definitions = {};
var apiMetaList = [];
var OpenApiModel = (function () {
    function OpenApiModel() {
    }
    OpenApiModel.initialize = function () {
        require('../controllers/SwaggerController');
    };
    OpenApiModel.createApi = function (ctor) {
        var api = apiMetaList.find(function (api) { return api.class === ctor; });
        if (!api) {
            var name_1 = this.clampName(ctor.name);
            api = { class: ctor, operations: [], option: { tags: [name_1] } };
            apiMetaList.push(api);
        }
        return api;
    };
    OpenApiModel.createOperation = function (ctor, name, option) {
        var api = this.createApi(ctor);
        var operation = api.operations.find(function (operation) { return operation.method === name; });
        if (!operation) {
            operation = { api: api, consumes: null, method: name, option: option, parameters: [] };
            api.operations.push(operation);
        }
        return operation;
    };
    OpenApiModel.createApiModel = function (ctor) {
        var name = ctor.name;
        if (!definitions[name]) {
            definitions[name] = { title: '', description: '', properties: {} };
        }
        return definitions[name];
    };
    OpenApiModel.addApi = function (option, controller) {
        var name = this.clampName(controller.name);
        var api = this.createApi(controller);
        api.option = option;
        api.option.tags = (option.tags || [option.value || name]);
    };
    OpenApiModel.addOperation = function (option, ctor, name) {
        var operation = this.createOperation(ctor, name, option);
        operation.option = option;
    };
    OpenApiModel.addOperationParams = function (params, ctor, name) {
        var _this = this;
        params
            .filter(function (param) { return !!param; })
            .forEach(function (param) { return _this.addOperationParam(param, ctor, name); });
    };
    OpenApiModel.addOperationParam = function (param, ctor, name) {
        var operation = this.createOperation(ctor, name, {});
        operation.parameters.push({
            name: param.name,
            required: param.required,
            description: param.value,
            in: param.dataType === 'file' ? 'formData' : param.paramType,
            type: param.dataType,
            schema: {
                $ref: null,
            }
        });
    };
    OpenApiModel.addModel = function (modelOptions, ctor) {
        var model = this.createApiModel(ctor);
        model.title = modelOptions.value || ctor.name;
        model.description = modelOptions.description;
    };
    OpenApiModel.addModelProperty = function (propertyOptions, ctor, name) {
        var model = this.createApiModel(ctor);
        model.properties[name] = {
            description: propertyOptions.value,
            required: propertyOptions.required,
            example: propertyOptions.example,
            type: typeof (propertyOptions.example || '')
        };
    };
    OpenApiModel.clampName = function (name) {
        var k = name.length;
        var newName = '';
        for (var i = 0; i < k; i++) {
            var code = name.charCodeAt(i);
            var isUpperCase = code >= 65 && code <= 90;
            var joinChar = isUpperCase ? '-' : '';
            newName = newName + joinChar + (name[i]).toLowerCase();
        }
        return newName.replace(/^-/, '');
    };
    OpenApiModel.build = function () {
        var _this = this;
        var documentation = {
            info: {
                title: pkg.name,
                version: pkg.version,
                description: pkg.description || ''
            },
            tags: [],
            paths: {},
            servers: [
                { url: RouteCollection_1.default.base || '/' }
            ],
            definitions: definitions,
            swagger: '2.0',
        };
        apiMetaList.forEach(function (api) {
            var paths = documentation.paths;
            documentation.tags = documentation.tags.concat(api.option.tags || []);
            api.operations.forEach(function (operation) { return _this.buildOperation(paths, operation); });
        });
        return documentation;
    };
    OpenApiModel.buildOperation = function (paths, operation) {
        var _a;
        var option = operation.option;
        var api = operation.api;
        var descriptor = ControllerManagement_1.default.getControllerDescriptor(api.class);
        var actionDescriptor = descriptor.actions[operation.method];
        if (!actionDescriptor || !actionDescriptor.mapping) {
            return;
        }
        var mainMapping = descriptor.mapping;
        var mapping = actionDescriptor.mapping;
        var code = 'code' in option ? option.code : '200';
        var model = definitions[option.dataType];
        var operationDoc = {
            consumes: mapping.consumes || operation.consumes,
            deprecated: false,
            operationId: operation.method,
            tags: api.option.tags,
            summary: option.value,
            description: option.notes,
            parameters: this.buildOperationParameters(operation),
            responses: (_a = {
                    "201": { "description": "Created" },
                    "401": { "description": "Unauthorized" },
                    "403": { "description": "Forbidden" },
                    "404": { "description": "Not Found" }
                },
                _a[code] = {
                    "description": "OK",
                    "schema": {
                        type: model ? undefined : option.dataType,
                        $ref: model ? '#/definitions/' + option.dataType : undefined
                    }
                },
                _a)
        };
        mainMapping.value.forEach(function (m) {
            mapping.value.forEach(function (url) {
                url = m + url;
                Object.keys(mapping.method).forEach(function (method) {
                    var path = (paths[url] = {});
                    path[method.toLowerCase()] = operationDoc;
                });
            });
        });
    };
    OpenApiModel.buildOperationParameters = function (operation) {
        operation.parameters.forEach(function (parameter) {
            var dataType = parameter.type;
            var model = definitions[dataType];
            if (dataType === 'file' && !operation.consumes) {
                operation.consumes = ['multipart/form-data'];
            }
            parameter.type = model ? undefined : dataType || 'string',
                parameter.schema = {
                    $ref: model ? '#/definitions/' + dataType : undefined,
                };
        });
        return operation.parameters;
    };
    return OpenApiModel;
}());
exports.default = OpenApiModel;
hot_1.default.create(module).preload(function (old) {
    var info = old.exports.default || old.exports;
    if (typeof info !== 'function') {
        return;
    }
    var api = apiMetaList.find(function (api) { return api.class === info; });
    if (api) {
        var index = apiMetaList.indexOf(api);
        console.log('find inddex', index);
        apiMetaList.splice(index, 1);
    }
    delete definitions[info.name];
});
//# sourceMappingURL=index.js.map