export interface MyGlobal {
  NODE_MVC_STARTER_TIME?: number
  nodeWebMvcStarter?: {
    outDir: string
    rootDir: string
    resolveOutputFile: (filename: string) => string
  }
}
