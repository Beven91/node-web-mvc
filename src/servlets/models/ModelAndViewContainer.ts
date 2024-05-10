import HttpStatus from "../http/HttpStatus";
import View from "../view/View";

export default class ModelAndViewContainer {

  public status: HttpStatus

  public view: View | string

  public redirect: Record<string, any> = {};

  public requestHandled: boolean

  public isViewReference() {
    return typeof this.view == 'string';
  }

  public get model() {
    return this.redirect;
  }

  addAttribute(name: string, value: object) {
    if (!value) return;
    this.model[name] = value;
  }

  addAllAttributes(attributes: object) {
    if (!attributes) return;
    Object.keys(attributes).forEach((key) => {
      this.model[key] = attributes[key];
    })
  }

  containAttribute(name: string) {
    return name in this.model;
  }

  mergeAttributes(attributes: object) {
    if (!attributes) return;
    Object.keys(attributes).forEach((key) => {
      if (!this.containAttribute(key)) {
        this.model[key] = attributes[key];
      }
    })
  }
}