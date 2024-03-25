import Component from "../../../ioc/annotations/Component";
import type HttpServletRequest from "../../http/HttpServletRequest";
import type HttpServletResponse from "../../http/HttpServletResponse";
import View from "../../view/View";

@Component("error")
export default class DefaultErrorView extends View {
  render(model: any, request: HttpServletRequest, response: HttpServletResponse) {
    const template = `
    <html>
      <head></head>
      <body>
        <h1>Whitelabel Error Page</h1>
        <p>This application has no explicit mapping for /error, so you are seeing this as a fallback.</p>
        <div id="created">${new Date().toUTCString()}</div>
        <div>There was an unexpected error (type=${model.message}, status=${model.code}).</div>
      </body>
    </html>
    `
    response.end(template.trim());
  }
}