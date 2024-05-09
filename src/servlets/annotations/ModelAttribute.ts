

/**
 * @module ModelAttribute
 */

import Target from "./Target";
import ElementType from "./annotation/ElementType";

class ModelAttribute {

  value?: string

  binding = true

}

export default Target([ElementType.PARAMETER, ElementType.METHOD])(ModelAttribute);