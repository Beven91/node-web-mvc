import ts, { TransformationContext } from 'typescript';

interface WithModifiersNode {
  modifiers?: ts.NodeArray<ts.ModifierLike>
}

const controllerDecorators = {
  'RestController': true,
  'Controller': true,
};

const actionDecorators = {
  'GetMapping': true,
  'PostMapping': true,
  'PutMapping': true,
  'DeleteMapping': true,
  'PatchMapping': true,
  'RequestMapping': true,
};

// 判定是否包含指定注解
const hasDecorator = (node: WithModifiersNode, decorators: Record<string, boolean>) => {
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

export default function enhanceTypeTransformer(context: TransformationContext) {
  // const map: Record<string, string> = {};
  return (rootNode: ts.SourceFile) => {
    // 遍历controller
    const visitController = (node: ts.Node) => {
      if (ts.isClassDeclaration(node) && hasDecorator(node, controllerDecorators)) {
        const name = node.name.getText();
        // 如果是Controller类
        return ts.visitEachChild(node, (aNode) => visitAction(aNode, name), context);
      }
      return ts.visitEachChild(node, visitController, context);
    };
    // 变量action
    const visitAction = (node: ts.Node, controllerName: string) => {
      if ((ts.isMethodDeclaration(node) && hasDecorator(node, actionDecorators))) {
        const name = node.name.getText();
        // 如果是action，则开始生成返回类型
        const typeName = node.type?.getText?.();
        if (typeName) {
          return ts.factory.updateMethodDeclaration(
            node,
            [
              ...node.modifiers,
              ts.factory.createDecorator(
                ts.factory.createCallExpression(
                  ts.factory.createIdentifier('Reflect.ReturnType'),
                  [
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                  ],
                  [
                    ts.factory.createStringLiteral(typeName),
                  ]
                )
              ),
            ],
            node.asteriskToken,
            node.name,
            node.questionToken,
            node.typeParameters,
            node.parameters,
            node.type,
            node.body
          );
        }
      }
      return node;
    };
    return ts.visitNode(rootNode, visitController) as ts.SourceFile;
  };
}
