import ts, { TransformationContext } from 'typescript';
import { createRuntimeTypeArguments, ExtTransformationContext, GenerateContext, hasDecorator } from './helper';

const metadata = '__metadata';

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


// 生成函数返回值注解
const generateFunctionRuntimeReturnType = (typeNode: ts.TypeNode, node: ts.MethodDeclaration, gContext: GenerateContext) => {
  return ts.factory.updateMethodDeclaration(
    node,
    [
      ...(node.modifiers || []),
      ts.factory.createDecorator(
        ts.factory.createCallExpression(
          ts.factory.createIdentifier(metadata),
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
};

// 生成函数参数类型运行时类型注解
const generateParameterRuntimeType = (typeNode: ts.TypeNode, node: ts.ParameterDeclaration, gContext: GenerateContext) => {
  return ts.factory.updateParameterDeclaration(
    node,
    [
      ...(node.modifiers || []),
      ts.factory.createDecorator(
        ts.factory.createCallExpression(
          ts.factory.createIdentifier(metadata),
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
  );
};

// 生成属性类型运行时类型注解
const generatePropertyRuntimeType = (typeNode: ts.TypeNode, node: ts.PropertyDeclaration, gContext: GenerateContext) => {
  return ts.factory.updatePropertyDeclaration(
    node,
    [
      ...(node.modifiers || []),
      ts.factory.createDecorator(
        ts.factory.createCallExpression(
          ts.factory.createIdentifier(metadata),
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
};

export default function enhanceTypeTransformer(context: ExtTransformationContext, program: ts.Program) {
  const typeChecker = program.getTypeChecker();
  return (rootNode: ts.SourceFile) => {
    const gContext: GenerateContext = {
      transContext: context,
      checker: typeChecker,
      moduleImports: {},
    };
    // 遍历controller
    const visitController = (node: ts.Node) => {
      if (!ts.isClassDeclaration(node)) {
        return ts.visitEachChild(node, visitController, context);
      }
      if (hasDecorator(node, controllerDecorators)) {
        // 如果是Controller
        return ts.visitEachChild(node, (cNode) => visitAction(cNode, gContext), context);
      } else {
        // 如果是class 则带注解的属性运行时类型
        return ts.visitEachChild(node, (cNode) => visitProperties(cNode, gContext), context);
      }
    };

    // 遍历action
    const visitAction = (node: ts.Node, gContext: GenerateContext) => {
      if ((ts.isMethodDeclaration(node) && hasDecorator(node, actionDecorators))) {
        const declaration = node as ts.MethodDeclaration;
        // 如果是action，则开始生成返回类型
        const typeName = node.type?.getText?.();
        if (typeName) {
          node = generateFunctionRuntimeReturnType(node.type, node, gContext);
        }
        return ts.visitEachChild(node, (cNode) => visitMethodParameterAndReturn(cNode, gContext, declaration), context);
      }
      return node;
    };

    // 遍历Parameter
    const visitMethodParameterAndReturn = (node: ts.Node, gContext: GenerateContext, methodNode: ts.MethodDeclaration) => {
      if (ts.isParameter(node)) {
        const typeName = node.type?.getText?.();
        if (typeName) {
          return generateParameterRuntimeType(node.type, node, gContext);
        }
      }
      return node;
    };


    // 遍历类属性
    const visitProperties = (node: ts.Node, gContext: GenerateContext) => {
      if (ts.isPropertyDeclaration(node) && node.modifiers?.length > 0) {
        const typeName = node.type?.getText?.();
        if (typeName) {
          return generatePropertyRuntimeType(node.type, node, gContext);
        }
      }
      return node;
    };

    context.runtimeTypeModuleImports = gContext.moduleImports;

    return ts.visitNode(rootNode, visitController) as ts.SourceFile;
  };
}
