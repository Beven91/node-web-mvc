import ts from "typescript";
import { mainVersion } from "../context";

export type ModifierLike = ts.Decorator | ts.Modifier

type v4CreateImportDeclaration = (decorators: readonly ts.Decorator[] | undefined, modifiers: readonly ts.Modifier[] | undefined, importClause: ts.ImportClause | undefined, moduleSpecifier: ts.Expression) => ts.ImportDeclaration
type v5CreateImportDeclaration = (modifiers: readonly ModifierLike[] | undefined, importClause: ts.ImportClause | undefined, moduleSpecifier: ts.Expression, attributes?: any) => ts.ImportDeclaration;
type v4CreateImportSpecifier = (propertyName: ts.Identifier | undefined, name: ts.Identifier) => ts.ImportSpecifier;
type v5CreateImportSpecifier = (isTypeOnly: boolean, propertyName: ts.Identifier | undefined, name: ts.Identifier) => ts.ImportSpecifier;
export type V4WithDecoratorNode = {
  decorators: readonly ts.Decorator[] | undefined;
  modifiers: readonly ts.Modifier[] | undefined;
}

function createImportDeclaration(node: ts.ImportDeclaration, name: ts.Identifier, namedBindings: ts.ImportSpecifier[]) {
  const originCreateImportDeclaration = ts.factory.createImportDeclaration.bind(ts.factory) as any;
  const v4Node = node as any as V4WithDecoratorNode;
  switch (mainVersion) {
    case 4:
      {
        const createImportDeclaration = originCreateImportDeclaration as v4CreateImportDeclaration;
        return createImportDeclaration(
          v4Node.decorators,
          v4Node.modifiers,
          ts.factory.updateImportClause(
            node.importClause,
            node.importClause.isTypeOnly,
            name,
            ts.factory.createNamedImports(
              namedBindings
            )
          ),
          node.moduleSpecifier,
        );
      }
    default:
      {
        const createImportDeclaration = originCreateImportDeclaration as v5CreateImportDeclaration;
        return createImportDeclaration(
          node.modifiers as any as ts.Modifier[],
          ts.factory.updateImportClause(
            node.importClause,
            node.importClause.isTypeOnly,
            name,
            ts.factory.createNamedImports(
              namedBindings
            )
          ),
          node.moduleSpecifier,
          undefined
        );
      }
  }
}

function createImportSpecifier(propertyName: ts.Identifier, name: ts.Identifier, isTypeOnly?: boolean){
  const originalCreateImportSpecifier = ts.factory.createImportSpecifier.bind(ts.factory) as any;
  const v4CreateImportSpecifier = originalCreateImportSpecifier as v4CreateImportSpecifier;
  const v5CreateImportSpecifier = originalCreateImportSpecifier as v5CreateImportSpecifier;
  switch(mainVersion) {
    case 4:
      return v4CreateImportSpecifier(propertyName, name)
    default:
      return v5CreateImportSpecifier(isTypeOnly, propertyName, name)
  }

}

export default {
  createImportSpecifier,
  createImportDeclaration
}