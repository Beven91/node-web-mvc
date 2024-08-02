
/**
 * @module RestController
 * @description 标注指定类为一个rest 风格的controller
 */

import Target from './Target';
import ElementType from './annotation/ElementType';
import ResponseBody from './ResponseBody';
import Controller from './Controller';
import Merge from './Merge';

@Merge(
  Controller,
  ResponseBody
)
class RestController {

}

/**
 * 标注指定类为一个rest 风格的controller
 */
export default Target(ElementType.TYPE)(RestController);
