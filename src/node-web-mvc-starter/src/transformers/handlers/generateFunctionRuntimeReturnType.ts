import ts, { AsteriskToken, Block, Decorator, MethodDeclaration, Modifier, ParameterDeclaration, PropertyName, QuestionToken, TypeNode, TypeParameterDeclaration } from 'typescript';
import { createRuntimeTypeArguments } from '../helper';
import { GenerateContext } from '../context';
import { ModifierLike, V4WithDecoratorNode } from './compact';

type v4UpdateMethodDeclaration = (node: MethodDeclaration, decorators: readonly Decorator[] | undefined, modifiers: readonly Modifier[] | undefined, asteriskToken: AsteriskToken | undefined, name: PropertyName, questionToken: QuestionToken | undefined, typeParameters: readonly TypeParameterDeclaration[] | undefined, parameters: readonly ParameterDeclaration[], type: TypeNode | undefined, body: Block | undefined)=>MethodDeclaration;
type v5UpdateMethodDeclaration = (node: MethodDeclaration, modifiers: readonly ModifierLike[] | undefined, asteriskToken: AsteriskToken | undefined, name: PropertyName, questionToken: QuestionToken | undefined, typeParameters: readonly TypeParameterDeclaration[] | undefined, parameters: readonly ParameterDeclaration[], type: TypeNode | undefined, body: Block | undefined)=> MethodDeclaration;


// 生成函数返回值注解
export default function generateFunctionRuntimeReturnType(typeNode: TypeNode, node: MethodDeclaration, gContext: GenerateContext) {
  const originalUpdateMethodDeclaration = ts.factory.updateMethodDeclaration.bind(ts.factory) as any;
  const v4UpdateMethodDeclaration = originalUpdateMethodDeclaration as v4UpdateMethodDeclaration;
  const v5UpdateMethodDeclaration = originalUpdateMethodDeclaration as v5UpdateMethodDeclaration;
  const v4Node = node as any as V4WithDecoratorNode;
  switch (gContext.mainVersion) {
    case 4:
      return v4UpdateMethodDeclaration(
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
        node.asteriskToken,
        node.name,
        node.questionToken,
        node.typeParameters,
        node.parameters,
        node.type,
        node.body
      );
    default:
      return v5UpdateMethodDeclaration(
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
        node.asteriskToken,
        node.name,
        node.questionToken,
        node.typeParameters,
        node.parameters,
        node.type,
        node.body
      );
  }
};
