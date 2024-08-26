import ts, { Decorator, ExclamationToken, Expression, Modifier, PropertyDeclaration, PropertyName, QuestionToken, TypeNode } from "typescript";
import { GenerateContext } from "../context";
import { createRuntimeTypeArguments } from "../helper";
import { ModifierLike, V4WithDecoratorNode } from "./compact";

type v4UpdatePropertyDeclaration = (node: PropertyDeclaration, decorators: readonly Decorator[] | undefined, modifiers: readonly Modifier[] | undefined, name: string | PropertyName, questionOrExclamationToken: QuestionToken | ExclamationToken | undefined, type: TypeNode | undefined, initializer: Expression | undefined) => PropertyDeclaration;
type v5UpdatePropertyDeclaration = (node: PropertyDeclaration, modifiers: readonly ModifierLike[] | undefined, name: string | PropertyName, questionOrExclamationToken: QuestionToken | ExclamationToken | undefined, type: TypeNode | undefined, initializer: Expression | undefined)=> PropertyDeclaration;


// 生成属性类型运行时类型注解
export default function generatePropertyRuntimeType(typeNode: ts.TypeNode, node: ts.PropertyDeclaration, gContext: GenerateContext) {
  const originalUpdateMethodDeclaration = ts.factory.updatePropertyDeclaration.bind(ts.factory) as any;
  const v4UpdatePropertyDeclaration = originalUpdateMethodDeclaration as v4UpdatePropertyDeclaration;
  const v5UpdatePropertyDeclaration = originalUpdateMethodDeclaration as v5UpdatePropertyDeclaration;

  switch (gContext.mainVersion) {
    case 4:
      return v4UpdatePropertyDeclaration(
        node,
        [
          ...((node as any as V4WithDecoratorNode).decorators || []),
          ts.factory.createDecorator(
            ts.factory.createCallExpression(
              ts.factory.createIdentifier(gContext.metadataName),
              undefined,
              createRuntimeTypeArguments(typeNode, gContext)
            )
          ),
        ],
        node.modifiers as any,
        node.name,
        node.questionToken,
        node.type,
        node.initializer
      );
    default:
      return v5UpdatePropertyDeclaration(
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
        node.name,
        node.questionToken,
        node.type,
        node.initializer
      );
  }
};