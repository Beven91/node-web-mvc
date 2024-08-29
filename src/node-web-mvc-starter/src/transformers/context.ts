import ts, { TransformationContext } from 'typescript';

export const mainVersion = Number(ts.version.split('.').shift());

export interface ModuleImport {
  name: string;
  request: string
}

export type GenerateContext = {
  metadataName: string
  mainVersion: number
  transContext: TransformationContext
  checker: ts.TypeChecker
  moduleImports: {
    [x: string]: ModuleImport
  }
};

export function createContext(context: TransformationContext, program: ts.Program): GenerateContext {
  return {
    mainVersion: mainVersion,
    metadataName: '__metadata',
    transContext: context,
    checker: program.getTypeChecker(),
    moduleImports: {},
  };
}
