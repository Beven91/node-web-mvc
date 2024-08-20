import ts, { TransformationContext } from 'typescript';
import { isIdentifierOf } from './helper';

export default function removeHotUpdateTransformer(context: TransformationContext, program: ts.Program) {
  return (rootNode: ts.SourceFile) => {
    const visitNode = (node: ts.Node) => {
      if (!ts.isExpressionStatement(node)) {
        return ts.visitEachChild(node, visitNode, context);
      }
      const firstToken = node.getFirstToken();
      // if (firstToken.kind & ts.SyntaxKind.RegularExpressionLiteral) {
      //   firstToken = node.getChildAt(1);
      // }
      if (isIdentifierOf(firstToken, 'hot', 'nodejs-hmr', program.getTypeChecker())) {
        return ts.factory.createJSDocComment('removed hot update code');
      }
    };

    return ts.visitNode(rootNode, visitNode) as ts.SourceFile;
  };
}
