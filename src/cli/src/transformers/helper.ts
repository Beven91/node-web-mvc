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
  return {
    isParameter: (type.flags & ts.TypeFlags.TypeParameter) !== 0,
    isRuntime: isValue || isClassOrFunction && isValue,
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
    if (symbol && symbol.declarations.length > 0) {
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

function createTypeDefinitionByIdentifier(typeNode: ts.NodeWithTypeArguments, typeIdentifier: ts.EntityName, meta: ReturnType<typeof getDeclareType>, gContext: GenerateContext) {
  const properties: ts.ObjectLiteralElementLike[] = [];
  const aliasName = getAliasQualifiedName(typeIdentifier, gContext.typeChecker);
  const name = aliasName || getTypeNodeName(typeNode);
  properties.push(ts.factory.createPropertyAssignment('name', ts.factory.createStringLiteral(name)));
  if (meta?.isRuntime) {
    properties.push(ts.factory.createPropertyAssignment('type', ts.factory.createIdentifier(name)));
  }
  if (meta?.isParameter) {
    properties.push(ts.factory.createPropertyAssignment('tp', ts.factory.createTrue()));
  }
  const args = typeNode.typeArguments?.map?.((m) => createTypeDefinition(m, gContext)).filter(Boolean);
  if (args?.length > 0) {
    const typeArguments = ts.factory.createArrayLiteralExpression(args);
    properties.push(ts.factory.createPropertyAssignment('args', typeArguments));
  }
  return ts.factory.createObjectLiteralExpression(properties);
}

function createTypeDefinition(typeNode: ts.TypeNode, gContext: GenerateContext): ts.Expression {
  if (ts.isTypeReferenceNode(typeNode)) {
    const meta = getDeclareType(typeNode.typeName, gContext.typeChecker);
    return createTypeDefinitionByIdentifier(typeNode, typeNode.typeName, meta, gContext);
  } else if (ts.isTypeQueryNode(typeNode)) {
    const meta = {
      isParameter: false,
      isRuntime: true,
    };
    return createTypeDefinitionByIdentifier(typeNode, typeNode.exprName, meta, gContext);
  } else if (ts.isUnionTypeNode(typeNode)) {
    return ts.factory.createObjectLiteralExpression([
      ts.factory.createPropertyAssignment(
        'types',
        ts.factory.createArrayLiteralExpression(
          typeNode.types.map((m) => createTypeDefinition(m, gContext))
        )
      ),
    ]);
  }
  return null;
}

export function createRuntimeTypeArguments(typeNode: ts.TypeNode, gContext: GenerateContext): ts.Expression[] {
  const type = createTypeDefinition(typeNode, gContext);
  const name = typeNode.getText();
  return [
    ts.factory.createStringLiteral(name),
    type,
  ].filter(Boolean);
}
