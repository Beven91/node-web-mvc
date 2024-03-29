import ServletContext from "./ServletContext";

export interface IDispatcher {

  doService(servletContext: ServletContext)

}