/**
 * 将所有SpringBootApplication
 * 参数值追加 isDist: true
 */
import ts from 'typescript';
import { ExtTransformationContext, getNodeText, isDecorator, isIdentifierImportOf } from './helper';

export default function enhanceProdTransformer(context: ExtTransformationContext, program: ts.Program) {
  const checker = program.getTypeChecker();
  return (sourceFile: ts.SourceFile) => {
    const updateSpringBootApplication = (node: ts.Node) => {
      if (!isDecorator(node, { SpringBootApplication: true })) {
        // 如果不是SpringBootApplication 注解
        return node;
      }
      const decorator = node as ts.Decorator;
      const callExpression = decorator.expression as ts.CallExpression;
      const identifier = callExpression.expression as ts.Identifier;
      if (!isIdentifierImportOf(identifier, 'node-web-mvc', checker)) {
        // 如果不是从node-web-mvc导入
        return node;
      }
      const arg = callExpression.arguments[0];
      if (ts.isObjectLiteralExpression(arg)) {
        return ts.factory.updateDecorator(
          decorator,
          ts.factory.updateCallExpression(
            callExpression,
            callExpression.expression,
            callExpression.typeArguments,
            [
              ts.factory.updateObjectLiteralExpression(
                arg,
                [
                  ...arg.properties.filter((m) => getNodeText(m.name) !== 'hot'),
                  ts.factory.createPropertyAssignment('isDist', ts.factory.createTrue()),
                ]),
            ]
          )
        );
      }
      return node;
    };

    const visitClassDeclarations = (node: ts.Node) => {
      if (ts.isClassDeclaration(node)) {
        return ts.visitEachChild(node, updateSpringBootApplication, context);
      }
      return node;
    };

    return ts.visitEachChild(sourceFile, visitClassDeclarations, context);
  };
}
