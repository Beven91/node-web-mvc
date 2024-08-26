import ts, { BindingName, Decorator, DotDotDotToken, Expression, Modifier, ParameterDeclaration, QuestionToken, TypeNode } from "typescript";
import { GenerateContext } from "../context";
import { createRuntimeTypeArguments } from "../helper";
import { ModifierLike, V4WithDecoratorNode } from "./compact";

type v4UpdateParameterDeclaration = (node: ParameterDeclaration, decorators: readonly Decorator[] | undefined, modifiers: readonly Modifier[] | undefined, dotDotDotToken: DotDotDotToken | undefined, name: string | BindingName, questionToken: QuestionToken | undefined, type: TypeNode | undefined, initializer: Expression | undefined) => ParameterDeclaration;
type v5UpdateParameterDeclaration = (node: ParameterDeclaration, modifiers: readonly ModifierLike[] | undefined, dotDotDotToken: DotDotDotToken | undefined, name: string | BindingName, questionToken: QuestionToken | undefined, type: TypeNode | undefined, initializer: Expression | undefined) => ParameterDeclaration;

// 生成函数参数类型运行时类型注解
export default function generateParameterRuntimeType(typeNode: ts.TypeNode, node: ts.ParameterDeclaration, gContext: GenerateContext) {
  const originalUpdateMethodDeclaration = ts.factory.updateParameterDeclaration.bind(ts.factory) as any;
  const v4UpdateParameterDeclaration = originalUpdateMethodDeclaration as v4UpdateParameterDeclaration;
  const v5UpdateParameterDeclaration = originalUpdateMethodDeclaration as v5UpdateParameterDeclaration;
  const v4Node = node as any as V4WithDecoratorNode;
  switch (gContext.mainVersion) {
    case 4:
      return v4UpdateParameterDeclaration(
        node,
        [
          ...(v4Node.decorators || []),
          ts.factory.createDecorator(
            ts.factory.createCallExpression(
              ts.factory.createIdentifier(gContext.metadataName),
              undefined,
              createRuntimeTypeArguments(typeNode, gContext)
            )
          ),
        ],
        v4Node.modifiers,
        node.dotDotDotToken,
        node.name,
        node.questionToken,
        node.type,
        node.initializer
      )
    default:
      return v5UpdateParameterDeclaration(
        node,
        [
          ...(node.modifiers || []),
          ts.factory.createDecorator(
            ts.factory.createCallExpression(
              ts.factory.createIdentifier(gContext.metadataName),
              undefined,
              createRuntimeTypeArguments(typeNode, gContext)
            )
          ),
        ],
        node.dotDotDotToken,
        node.name,
        node.questionToken,
        node.type,
        node.initializer
      )
  }
};