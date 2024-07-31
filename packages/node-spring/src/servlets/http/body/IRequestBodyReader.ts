import ServletContext from '../ServletContext';

export interface IRequestBodyReader {
  read(servletContext: ServletContext): Promise<Record<string, any>>;
}
