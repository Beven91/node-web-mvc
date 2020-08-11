import './interface/polyfill';
import 'reflect-metadata';
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
import HandlerInterceptor from './servlets/interceptor/HandlerInterceptor';
import HandlerInterceptorAdapter from './servlets/interceptor/HandlerInterceptorAdapter';
import Api from './swagger/annotations/Api';
import ApiOperation from './swagger/annotations/ApiOperation';
import ApiModel from './swagger/annotations/ApiModel';
import ApiModelProperty from './swagger/annotations/ApiModelProperty';
import ApiImplicitParams from './swagger/annotations/ApiImplicitParams';
import ResponseStatus from './servlets/annotations/ResponseStatus';
import RequestBody from './servlets/annotations/params/RequestBody';
import RequestParam from './servlets/annotations/params/RequestParam';
import ServletRequest from './servlets/annotations/params/ServletRequest';
import ServletResponse from './servlets/annotations/params/ServletResponse';
import PathVariable from './servlets/annotations/params/PathVariable';
import RequestHeader from './servlets/annotations/params/RequestHeader';
import MultipartFile from './servlets/http/MultipartFile';
import HttpMessageConverter from './servlets/http/converts/HttpMessageConverter';
import HandlerMethodArgumentResolver from './servlets/method/argument/HandlerMethodArgumentResolver';
import ViewResolver from './servlets/view/resolvers/ViewResolver';
import UrlBasedViewResolver from './servlets/view/resolvers/UrlBasedViewResolver';
import View from './servlets/view/View';
import HandlerMethod from './servlets/method/HandlerMethod';
import HandlerAdapter from './servlets/method/HandlerAdapter';
import RequestMemoryStream from './stream/RequestMemoryStream';
import Target from './servlets/annotations/Target';
import createParam from './servlets/annotations/params/createParam';
import ServletContext from './servlets/http/ServletContext';
import MethodParameter from './interface/MethodParameter';
import hot from './hot/index';
import ModelAndView from './servlets/models/ModelAndView';
import InterruptModel from './servlets/models/InterruptModel';
import ServletModel from './servlets/models/ServletModel';
import Middlewares from './servlets/models/Middlewares';
import Autowired from './ioc/annotations/Autowired';
import Component from './ioc/annotations/Component';
import Repository from './ioc/annotations/Repository';
import Service from './ioc/annotations/Service';
import HttpServletRequest from './servlets/http/HttpServletRequest';
import HttpServletResponse from './servlets/http/HttpServletResponse';
import MediaType from './servlets/http/MediaType';
import MessageConverter from './servlets/http/converts/MessageConverter';
import RuntimeAnnotation from './servlets/annotations/annotation/RuntimeAnnotation';
import AnnotationOptions from './servlets/annotations/annotation/AnnotationOptions';

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
  HandlerInterceptor,
  HandlerInterceptorAdapter,
  RequestBody,
  RequestParam,
  PathVariable,
  ServletRequest,
  ServletResponse,
  RequestHeader,
  MultipartFile,
  HttpMessageConverter,
  HandlerMethodArgumentResolver,
  View,
  Target,
  ViewResolver,
  ModelAndView,
  InterruptModel,
  ServletModel,
  UrlBasedViewResolver,
  RequestMemoryStream,
  ServletContext,
  MethodParameter,
  createParam,
  Autowired,
  Component,
  Service,
  Repository,
  Middlewares,
  MediaType,
  HttpServletRequest,
  HttpServletResponse,
  MessageConverter,
  ResponseStatus,
  HandlerMethod,
  HandlerAdapter,
  RuntimeAnnotation,
  AnnotationOptions
}

hot.create(module);
