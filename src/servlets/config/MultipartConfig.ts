export default interface MultipartConfig {
  /**
   * 上传单个文件的最大限制
   */
  maxFileSize: string | number,
  /**
   * 单个请求的最大限制
   */
  maxRequestSize: string | number
  /**
  * 上传资源文件存储目录
  */
  mediaRoot?: string
}
