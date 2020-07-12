import './interface/polyfill';
import Controller from './controller';
import AreaRegistration from './areaRegistration';
import Routes from './routes/RouteCollection';
import ControllerFactory from './ControllerFactory';
import Registry from './Registry';
import RequestMapping from './servlets/annotations/mapping/RequestMapping';
import PostMapping from './servlets/annotations/mapping/PostMapping';
import GetMapping from './servlets/annotations/mapping/GetMapping';
import PutMapping from './servlets/annotations/mapping/PutMapping';
import PatchMapping from './servlets/annotations/mapping/PatchMapping';
import DeleteMapping from './servlets/annotations/mapping/DeleteMapping';
import RestController from './servlets/annotations/RestController';
import Scope from './servlets/annotations/Scope';
import ControllerAdvice from './servlets/annotations/ControllerAdvice';
import ExceptionHandler from './servlets/annotations/ExceptionHandler';
import HandlerInteceptor from './servlets/interceptor/HandlerInteceptor';
import HandlerInterceptorAdapter from './servlets/interceptor/HandlerInterceptorAdapter';
import Api from './swagger/annotations/Api';
import ApiOperation from './swagger/annotations/ApiOperation';
import ApiModel from './swagger/annotations/ApiModel';
import ApiModelProperty from './swagger/annotations/ApiModelProperty';
import ApiImplicitParams from './swagger/annotations/ApiImplicitParams';
import RequestBody from './servlets/annotations/params/RequestBody';
import RequestParam from './servlets/annotations/params/RequestParam';
import ServletParam, { ServletRequest, ServletResponse } from './servlets/annotations/params/ServletParam';
import PathVariable from './servlets/annotations/params/PathVariable';
import RequestHeader from './servlets/annotations/params/RequestHeader';
import MultipartFile from './servlets/http/MultipartFile';
import HttpMessageConverter from './servlets/http/converts/HttpMessageConverter';
import HandlerMethodArgumentResolver from './servlets/method/argument/HandlerMethodArgumentResolver';
import ViewResolver from './servlets/view/resolvers/ViewResolver';
import UrlBasedViewResolver from './servlets/view/resolvers/UrlBasedViewResolver';
import View from './servlets/view/View';
import RequestMemoryStream from './stream/RequestMemoryStream';
import createParam from './servlets/annotations/params/createParam';
import hot from './hot/index';

export {
  hot,
  Scope,
  Api,
  ApiOperation,
  ApiModel,
  ApiModelProperty,
  ApiImplicitParams,
  Routes,
  Registry,
  Controller,
  GetMapping,
  PostMapping,
  DeleteMapping,
  PatchMapping,
  PutMapping,
  RestController,
  RequestMapping,
  AreaRegistration,
  ControllerAdvice,
  ExceptionHandler,
  ControllerFactory,
  HandlerInteceptor,
  HandlerInterceptorAdapter,
  RequestBody,
  RequestParam,
  PathVariable,
  ServletParam,
  ServletRequest,
  ServletResponse,
  RequestHeader,
  MultipartFile,
  HttpMessageConverter,
  HandlerMethodArgumentResolver,
  View,
  ViewResolver,
  UrlBasedViewResolver,
  RequestMemoryStream,
  createParam
}

hot.create(module);