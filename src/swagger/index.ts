import SwaggerController from './controllers/SwaggerController';
import OpenApi from './openapi/index';

export default function () {
  OpenApi.initialize();
  return SwaggerController;
}