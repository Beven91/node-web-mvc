import path from 'path';
import ts, { TransformationContext } from 'typescript';

interface WithModifiersNode {
  modifiers?: ts.NodeArray<ts.ModifierLike>
}

interface ModuleImportSpecifer {
  identifier: ts.Identifier,
  name: string
}

interface DeclareTypeInfo {
  flags: number
  isParameter: boolean,
  isRuntime: boolean,
  typeParameters: string[]
}


export interface ModuleImport {
  name: string;
  request: string
  allKeys: Record<string, boolean>
  default: ModuleImportSpecifer,
  identifiers: ModuleImportSpecifer[]
}

export interface RuntimeTypeDefinition {
  name: string
  runtime?: boolean,
  isParameter?: boolean
  uionTypes?: RuntimeTypeDefinition[]
  typeArguments?: RuntimeTypeDefinition[]
}

export type GenerateContext = {
  transContext: TransformationContext
  checker: ts.TypeChecker
  moduleImports: {
    [x: string]: ModuleImport
  }
};

export interface ExtTransformationContext extends TransformationContext {
  runtimeTypeModuleImports?: GenerateContext['moduleImports']
}

// 判定是否包含指定注解
export const hasDecorator = (node: WithModifiersNode, decorators: Record<string, boolean>) => {
  return !!node.modifiers?.find?.((m) => {
    if (ts.isDecorator(m)) {
      let name = m.expression.getText();
      if (ts.isCallExpression(m.expression)) {
        name = m.expression.expression.getText();
      }
      return decorators[name];
    }
  });
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
  return node.getText().replace(/^['"]|['"]$/g, '');
}

function makeImportIdentifier(symbol: ts.Symbol, gContext: GenerateContext) {
  const node = symbol.declarations.find((m) => ts.isImportSpecifier(m) || ts.isImportClause(m));
  const moduleImports = gContext.moduleImports;
  const importDeclaration = node ? findParent<ts.ImportDeclaration>(node, (m) => ts.isImportDeclaration(m)) : null;
  if (!importDeclaration) {
    return;
  }
  const importName = (node as ts.NamedDeclaration).name.getText();
  const request = getModuleRequest(importDeclaration.moduleSpecifier);
  const isDefault = ts.isImportClause(node);
  const moduleName = path.basename(request).replace(/[^a-zA-Z0-9]/g, '_') + '_1';

  if (!moduleImports[request]) {
    moduleImports[request] = {
      request: request,
      name: moduleName,
      default: null,
      allKeys: {},
      identifiers: [],
    };
  }

  const identifierName = importName;
  const opts = gContext.transContext.getCompilerOptions();
  switch (opts.module) {
    case ts.ModuleKind.CommonJS:
    case ts.ModuleKind.NodeNext:
    case ts.ModuleKind.UMD:
    case ts.ModuleKind.AMD:
    case ts.ModuleKind.Node16:
      // identifierName = isDefault ? `${moduleName}.default` : `${moduleName}.${importName}`;
      break;
    default:
      // identifierName = `${importName}_0`;
  }

  const moduleImport = moduleImports[request];
  const identifier = ts.factory.createIdentifier(identifierName);
  const item: ModuleImportSpecifer = { name: importName, identifier };
  if (isDefault) {
    moduleImport.default = item;
  } else {
    moduleImport.identifiers.push(item);
  }
  moduleImport.allKeys[importName] = true;
  return {
    identifier: identifier,
    request,
  };
}

export function getDeclareType(node: ts.EntityName, gContext: GenerateContext): DeclareTypeInfo {
  const typeChecker = gContext.checker;
  const symbol = typeChecker.getSymbolAtLocation(node);
  if (!symbol) return null;
  const type = typeChecker.getDeclaredTypeOfSymbol(symbol);
  const flags = type.symbol ? type.symbol.flags : symbol.flags;
  const isClassOrFunction = (flags & ts.SymbolFlags.Class) !== 0 || (flags & ts.SymbolFlags.Function) !== 0;
  const isValue = (flags & ts.SymbolFlags.Value) !== 0;
  const isParameter = (type.flags & ts.TypeFlags.TypeParameter) !== 0;
  makeImportIdentifier(symbol, gContext);
  return {
    isParameter: isParameter,
    isRuntime: isValue || isClassOrFunction && isValue,
    typeParameters: (type as any).typeArguments?.map?.((arg) => {
      return arg.symbol.escapedName;
    }) || [],
    flags,
  };
}

export function getTypeNodeName(typeNode: ts.TypeNode) {
  if (ts.isTypeReferenceNode(typeNode)) {
    return typeNode.typeName.getText();
  } else if (ts.isTypeQueryNode(typeNode)) {
    return typeNode.exprName.getText();
  } else {
    return typeNode.getText();
  }
}

function getAliasQualifiedName(typeName: ts.EntityName, checker: ts.TypeChecker): string | undefined {
  if (ts.isIdentifier(typeName)) {
    const symbol = checker.getSymbolAtLocation(typeName);
    if (symbol && symbol.declarations?.length > 0) {
      const declaration = symbol.declarations[0];
      if (ts.isTypeAliasDeclaration(declaration)) {
        if (ts.isTypeReferenceNode(declaration.type)) {
          return getAliasQualifiedName(declaration.type.typeName, checker);
        } else if (ts.isTypeQueryNode(declaration.type)) {
          return getAliasQualifiedName(declaration.type.exprName, checker);
        }
        return '';
      }
    }
  }
  return typeName.getText();
}

function createTypeDefinitionByIdentifier(typeNode: ts.NodeWithTypeArguments, typeIdentifier: ts.EntityName, meta: ReturnType<typeof getDeclareType>, gContext: GenerateContext, isArray: boolean, isRoot: boolean, parameterName?: string) {
  const properties: ts.ObjectLiteralElementLike[] = [];
  const aliasName = getAliasQualifiedName(typeIdentifier, gContext.checker);
  const name = aliasName || getTypeNodeName(typeNode);
  properties.push(ts.factory.createPropertyAssignment('name', ts.factory.createStringLiteral(name)));
  if (meta?.isRuntime) {
    properties.push(ts.factory.createPropertyAssignment('clazz', typeIdentifier as ts.Identifier));
  }
  if (meta.flags & ts.SymbolFlags.Enum) {
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
    const fullName = typeNode.getText();
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
    return createTypeDefinitionByIdentifier(typeNode, typeNode.typeName, meta, gContext, isArray, isRoot, parameterName);
  } else if (ts.isTypeQueryNode(typeNode)) {
    const meta: DeclareTypeInfo = {
      isParameter: false,
      isRuntime: true,
      typeParameters: [],
      flags: gContext.checker.getSymbolAtLocation(typeNode)?.flags || -1,
    };
    return createTypeDefinitionByIdentifier(typeNode, typeNode.exprName, meta, gContext, isArray, isRoot, parameterName);
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

export function getModulePath(declaration: ts.Declaration) {
  let current: ts.Node = declaration;
  while (current) {
    if (ts.isSourceFile(current)) {
      return current.fileName;
    }
    current = current.parent;
  }
}

export function isIdentifierOf(node: ts.Node, name: string, module: string, checker: ts.TypeChecker) {
  if (ts.isIdentifier(node) && node.text == name) {
    const symbol = checker.getTypeAtLocation(node)?.symbol;
    if (!symbol || !symbol?.valueDeclaration) {
      return false;
    }
    const filePath = getModulePath(symbol.valueDeclaration);
    return (filePath.indexOf(module) > -1);
  }
  return false;
}
