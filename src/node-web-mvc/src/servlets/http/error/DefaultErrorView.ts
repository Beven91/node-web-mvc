import Component from '../../../ioc/annotations/Component';
import type HttpServletRequest from '../HttpServletRequest';
import type HttpServletResponse from '../HttpServletResponse';
import View from '../../view/View';
import MediaType from '../MediaType';

@Component('error')
export default class DefaultErrorView extends View {
  async render(model: any, request: HttpServletRequest, response: HttpServletResponse) {
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
    `;
    await response.fullResponse(template.trim(), MediaType.TEXT_HTML);
  }
}
