/**
 * @module Paged
 */

import { ApiModel, ApiModelProperty } from 'node-web-mvc';

@ApiModel({ description: '分页数据' })
export default class Paged<T> {
   @ApiModelProperty({ value: '数据', dataType: '?' })
   models: T;
}
