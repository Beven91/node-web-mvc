import ServletContext from "../../http/ServletContext";

export default abstract class ErrorAttributes {
  abstract getErrorAttributes(servletContext: ServletContext): Record<string, string>
}