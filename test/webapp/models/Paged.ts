/**
 * @module Paged
 */

import { ApiModel, ApiModelProperty } from "../../../src";

 @ApiModel({ description:'分页数据' })
 export default class Paged<T> {

    @ApiModelProperty({ value:'数据',generic:true })
    models: T

 }