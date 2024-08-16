import ts, { TransformationContext } from 'typescript';

interface WithModifiersNode {
  modifiers?: ts.NodeArray<ts.ModifierLike>
}

export interface RuntimeTypeDefinition {
  name: string
  runtime?: boolean,
  isParameter?: boolean
  uionTypes?: RuntimeTypeDefinition[]
  typeArguments?: RuntimeTypeDefinition[]
}

export type GenerateContext = {
  transformContext: TransformationContext
  typeChecker: ts.TypeChecker
};

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

export function getDeclareType(node: ts.EntityName, typeChecker: ts.TypeChecker) {
  const symbol = typeChecker.getSymbolAtLocation(node);
  if (!symbol) return null;
  const type = typeChecker.getDeclaredTypeOfSymbol(symbol);
  const flags = type.symbol ? type.symbol.flags : symbol.flags;
  const isClassOrFunction = (flags & ts.SymbolFlags.Class) !== 0 || (flags & ts.SymbolFlags.Function) !== 0;
  const isValue = (flags & ts.SymbolFlags.Value) !== 0;
  const isParameter = (type.flags & ts.TypeFlags.TypeParameter) !== 0;
  return {
    isParameter: isParameter,
    isRuntime: isValue || isClassOrFunction && isValue,
    typeParameters: (type as any).typeArguments?.map?.((arg)=>{
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
  const aliasName = getAliasQualifiedName(typeIdentifier, gContext.typeChecker);
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

function createBasicType(name: string, identifier: string) {
  const properties: ts.ObjectLiteralElementLike[] = [];
  properties.push(ts.factory.createPropertyAssignment('name', ts.factory.createStringLiteral(name)));
  properties.push(ts.factory.createPropertyAssignment('clazz', ts.factory.createIdentifier(identifier)));
  return ts.factory.createObjectLiteralExpression(properties);
}

function createTokenType(tokenNode: ts.TypeNode) {
  switch (tokenNode.kind) {
    case ts.SyntaxKind.StringKeyword:
      return createBasicType('string', 'String');
    case ts.SyntaxKind.NumberKeyword:
      return createBasicType('number', 'Number');
    case ts.SyntaxKind.BooleanKeyword:
      return createBasicType('boolean', 'Boolean');
    case ts.SyntaxKind.BigIntKeyword:
      return createBasicType('bigint', 'BigInt');
    case ts.SyntaxKind.VoidKeyword:
      return null;
    default:
      return createBasicType('object', 'Object');
  }
}

function createTypeDefinition(typeNode: ts.TypeNode, gContext: GenerateContext, isArray?: boolean, isRoot?: boolean, parameterName?: string): ts.Expression {
  if (ts.isTypeReferenceNode(typeNode)) {
    // 类型引用
    const meta = getDeclareType(typeNode.typeName, gContext.typeChecker);
    return createTypeDefinitionByIdentifier(typeNode, typeNode.typeName, meta, gContext, isArray, isRoot, parameterName);
  } else if (ts.isTypeQueryNode(typeNode)) {
    const meta = {
      isParameter: false,
      isRuntime: true,
      typeParameters: [],
      flags: gContext.typeChecker.getSymbolAtLocation(typeNode)?.flags || -1,
    };
    return createTypeDefinitionByIdentifier(typeNode, typeNode.exprName, meta, gContext, isArray, isRoot, parameterName);
  } else if (ts.isUnionTypeNode(typeNode)) {
    const types = ts.factory.createArrayLiteralExpression(
      typeNode.types.map((m) => createTypeDefinition(m, gContext))
    );
    // 联合类型
    return ts.factory.createObjectLiteralExpression([
      ts.factory.createPropertyAssignment('fullName', ts.factory.createStringLiteral(typeNode.getText())),
      ts.factory.createPropertyAssignment(
        'types',
        types
      ),
    ]);
  } else if (ts.isArrayTypeNode(typeNode)) {
    // 数组类型
    return createTypeDefinition(typeNode.elementType, gContext, true, true, parameterName);
  } else if (ts.isToken(typeNode)) {
    return createTokenType(typeNode);
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
