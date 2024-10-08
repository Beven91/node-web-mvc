import path from 'path';
import ts, { TransformationContext } from 'typescript';
import { GenerateContext } from './context';
import compact from './handlers/compact';

interface WithModifiersNode {
  modifiers?: ts.NodeArray<ts.Node>
}

interface DeclareTypeInfo {
  flags: number
  isParameter: boolean,
  isRuntime: boolean,
  identifier: ts.EntityName
  typeParameters: string[]
}

export interface RuntimeTypeDefinition {
  name: string
  runtime?: boolean,
  isParameter?: boolean
  uionTypes?: RuntimeTypeDefinition[]
  typeArguments?: RuntimeTypeDefinition[]
}


export interface ExtTransformationContext extends TransformationContext {
}

export const isDecorator = (node: ts.Node, decorators: Record<string, boolean>) => {
  if (!ts.isDecorator(node)) {
    return false;
  }
  let name = '';
  if (ts.isIdentifier(node.expression)) {
    name = getNodeText(node.expression);
  } else if (ts.isCallExpression(node.expression)) {
    name = getNodeText(node.expression.expression);
  }
  return decorators[name];
};

// 判定是否包含指定注解
export const hasDecorator = (node: WithModifiersNode, decorators: Record<string, boolean>) => {
  return !!node.modifiers?.find?.((m) => isDecorator(m, decorators));
};

export function findParent<T extends ts.Node>(node: ts.Node, match: (current: ts.Node) => boolean): T {
  let current = node;
  while (current) {
    if (match(current)) {
      return current as T;
    }
    current = current.parent;
  }
}

export function getModuleRequest(node: ts.Expression) {
  return (node as any).text.replace(/^['"]|['"]$/g, '');
}

function makeImportIdentifier(symbol: ts.Symbol, gContext: GenerateContext) {
  if (!symbol.declarations) {
    return;
  }
  const node = symbol.declarations.find((m) => ts.isImportSpecifier(m) || ts.isImportClause(m));
  const moduleImports = gContext.moduleImports;
  const importDeclaration = node ? findParent<ts.ImportDeclaration>(node, (m) => ts.isImportDeclaration(m)) : null;
  if (!importDeclaration) {
    return;
  }
  const request = getModuleRequest(importDeclaration.moduleSpecifier);
  const moduleName = path.basename(request).replace(/[^a-zA-Z0-9]/g, '_');

  if (!moduleImports[request]) {
    moduleImports[request] = {
      request: request,
      name: moduleName,
    };
  }
}

function isRuntimeType(type: ts.Type) {
  if (!type?.symbol) {
    return false;
  }
  const flags = type.symbol.flags;
  const isClassOrFunction = (flags & ts.SymbolFlags.Class) !== 0 || (flags & ts.SymbolFlags.Function) !== 0;
  const isValue = (flags & ts.SymbolFlags.Value) !== 0;
  return isValue || isClassOrFunction && isValue;
}

function getAliasQualifiedName(typeName: ts.EntityName, gContext: GenerateContext): ts.EntityName {
  const symbol = gContext.checker.getSymbolAtLocation(typeName);
  const declaration = symbol.declarations[0];
  if (ts.isTypeAliasDeclaration(declaration)) {
    if (ts.isTypeReferenceNode(declaration.type)) {
      return getAliasQualifiedName(declaration.type.typeName, gContext);
    } else if (ts.isTypeQueryNode(declaration.type)) {
      return getAliasQualifiedName(declaration.type.exprName, gContext);
    }
    //  其他类型下，不形成runtimeType
  }
  return typeName;
}

export function getDeclareType(node: ts.EntityName, gContext: GenerateContext): DeclareTypeInfo {
  const typeChecker = gContext.checker;
  const symbol = typeChecker.getSymbolAtLocation(node);
  if (!symbol) return null;
  const type = typeChecker.getDeclaredTypeOfSymbol(symbol);
  const isParameter = (type.flags & ts.TypeFlags.TypeParameter) !== 0;
  const flags = type.symbol?.flags;
  makeImportIdentifier(symbol, gContext);
  return {
    identifier: getAliasQualifiedName(node, gContext),
    isParameter: isParameter,
    isRuntime: isRuntimeType(type),
    typeParameters: (type as any).typeArguments?.map?.((arg) => {
      return arg.symbol.escapedName;
    }) || [],
    flags: flags,
  };
}

function createTypeDefinitionByIdentifier(typeNode: ts.NodeWithTypeArguments, meta: ReturnType<typeof getDeclareType>, gContext: GenerateContext, isArray: boolean, isRoot: boolean, parameterName?: string) {
  const properties: ts.ObjectLiteralElementLike[] = [];
  const name = meta.identifier.getText();
  properties.push(ts.factory.createPropertyAssignment('name', ts.factory.createStringLiteral(name)));
  if (meta?.isRuntime) {
    properties.push(ts.factory.createPropertyAssignment('clazz', meta.identifier as ts.Identifier));
  }
  if (meta.flags > 0 && meta.flags & ts.SymbolFlags.Enum) {
    properties.push(ts.factory.createPropertyAssignment('enum', ts.factory.createTrue()));
  }
  if (meta?.isParameter) {
    if (ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName)) {
      ts.factory.updateTypeReferenceNode(typeNode, ts.factory.createIdentifier('?'), undefined);
    }
    properties.push(ts.factory.createPropertyAssignment('tp', ts.factory.createTrue()));
  }
  if (parameterName) {
    properties.push(ts.factory.createPropertyAssignment('at', ts.factory.createStringLiteral(parameterName)));
  }
  if (isArray) {
    properties.push(ts.factory.createPropertyAssignment('array', ts.factory.createTrue()));
  }
  const args = typeNode.typeArguments?.map?.((m, i) => createTypeDefinition(m, gContext, false, false, meta.typeParameters?.[i])).filter(Boolean);
  if (args?.length > 0) {
    const typeArguments = ts.factory.createArrayLiteralExpression(args);
    properties.push(ts.factory.createPropertyAssignment('args', typeArguments));
  }
  if (isRoot) {
    const fullName = ts.isTypeQueryNode(typeNode) ? typeNode.exprName.getText() : typeNode.getText();
    properties.push(ts.factory.createPropertyAssignment('fullName', ts.factory.createStringLiteral(fullName)));
  }
  return ts.factory.createObjectLiteralExpression(properties);
}

function createBasicType(name: string, identifier: string, parameterName: string) {
  const properties: ts.ObjectLiteralElementLike[] = [];
  if (parameterName) {
    properties.push(ts.factory.createPropertyAssignment('at', ts.factory.createStringLiteral(parameterName)));
  }
  properties.push(ts.factory.createPropertyAssignment('name', ts.factory.createStringLiteral(name)));
  properties.push(ts.factory.createPropertyAssignment('clazz', ts.factory.createIdentifier(identifier)));
  return ts.factory.createObjectLiteralExpression(properties);
}

function createTokenType(tokenNode: ts.TypeNode, parameterName?: string) {
  switch (tokenNode.kind) {
    case ts.SyntaxKind.StringKeyword:
      return createBasicType('string', 'String', parameterName);
    case ts.SyntaxKind.NumberKeyword:
      return createBasicType('number', 'Number', parameterName);
    case ts.SyntaxKind.BooleanKeyword:
      return createBasicType('boolean', 'Boolean', parameterName);
    case ts.SyntaxKind.BigIntKeyword:
      return createBasicType('bigint', 'BigInt', parameterName);
    case ts.SyntaxKind.VoidKeyword:
      return null;
    default:
      return createBasicType('object', 'Object', parameterName);
  }
}

function createTypeDefinition(typeNode: ts.TypeNode, gContext: GenerateContext, isArray?: boolean, isRoot?: boolean, parameterName?: string): ts.Expression {
  if (ts.isTypeReferenceNode(typeNode)) {
    // 类型引用
    const meta = getDeclareType(typeNode.typeName, gContext);
    return createTypeDefinitionByIdentifier(typeNode, meta, gContext, isArray, isRoot, parameterName);
  } else if (ts.isTypeQueryNode(typeNode)) {
    const meta: DeclareTypeInfo = {
      isParameter: false,
      isRuntime: false,
      identifier: typeNode.exprName,
      typeParameters: [],
      flags: -1,
    };
    return createTypeDefinitionByIdentifier(typeNode, meta, gContext, isArray, isRoot, parameterName);
  } else if (ts.isUnionTypeNode(typeNode)) {
    const types = ts.factory.createArrayLiteralExpression(
      typeNode.types.map((m) => createTypeDefinition(m, gContext))
    );
    // 联合类型
    return ts.factory.createObjectLiteralExpression([
      ts.factory.createPropertyAssignment('fullName', ts.factory.createStringLiteral(typeNode.getText())),
      ts.factory.createPropertyAssignment('types', types),
    ]);
  } else if (ts.isArrayTypeNode(typeNode)) {
    // 数组类型
    return createTypeDefinition(typeNode.elementType, gContext, true, true, parameterName);
  } else if (ts.isToken(typeNode)) {
    return createTokenType(typeNode, parameterName);
  }
  return null;
}

export function createRuntimeTypeArguments(typeNode: ts.TypeNode, gContext: GenerateContext): ts.Expression[] {
  const type = createTypeDefinition(typeNode, gContext, false, true);
  return [
    ts.factory.createStringLiteral('design:runtimetype'),
    type,
  ].filter(Boolean);
}

export function replaceToRuntimeImportDeclaration(node: ts.ImportDeclaration, checker: ts.TypeChecker) {
  const namedBindings: ts.ImportSpecifier[] = [];
  let name: ts.Identifier = undefined;
  if (node.importClause) {
    node.importClause.namedBindings?.forEachChild((child: ts.ImportSpecifier) => {
      const info = checker.getTypeAtLocation(child);
      const type = info.symbol ? checker.getDeclaredTypeOfSymbol(info.symbol) : null;
      if (isRuntimeType(type)) {
        namedBindings.push(
          compact.createImportSpecifier(child.propertyName, child.name)
        );
      }
    });
  }
  if (node.importClause?.name) {
    const info = checker.getTypeAtLocation(node.importClause.name);
    const type = info.symbol ? checker.getDeclaredTypeOfSymbol(info.symbol) : null;
    if (isRuntimeType(type)) {
      name = node.importClause.name;
    }
  }
  return compact.createImportDeclaration(node, name, namedBindings);
}

export function createRequireStatement(moduleName: string, request: string) {
  return ts.factory.createVariableStatement(
    undefined,
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          moduleName,
          undefined,
          undefined,
          ts.factory.createCallExpression(
            ts.factory.createIdentifier('require'),
            undefined,
            [ ts.factory.createStringLiteral(request) ]
          )
        ),
      ],
      ts.NodeFlags.Const
    )
  );
}

export const getNodeText = (node: ts.Node) => {
  const k = node as any;
  if (k.end < 0) {
    return k.text;
  }
  return node.getText();
};


export const isIdentifierImportOf = (node: ts.Identifier, request: string, checker: ts.TypeChecker) => {
  const symbol = checker.getSymbolAtLocation(node);
  const declaration = symbol ? symbol.declarations?.[0] : null;
  if (!declaration || !ts.isImportSpecifier(declaration)) {
    return false;
  }
  const ownerImport = declaration.parent.parent.parent;
  if (!ownerImport || !ts.isImportDeclaration(ownerImport)) {
    return false;
  }
  return ownerImport.moduleSpecifier.getText().slice(1, -1) == request;
};
