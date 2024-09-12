export interface MyGlobal {
  NODE_MVC_STARTER_TIME?: number
  nodeWebMvcStarter?: {
    outDir: string
    resolveOutputFile: (filename: string) => string
  }
}
