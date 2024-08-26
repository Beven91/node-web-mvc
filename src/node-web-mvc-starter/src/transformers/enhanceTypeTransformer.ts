import ts, { } from 'typescript';
import { replaceToRuntimeImportDeclaration, createRequireStatement, createRuntimeTypeArguments, ExtTransformationContext, GenerateContext, getModuleRequest, hasDecorator } from './helper';

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
  const context = gContext.transContext;
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

    const replaceDeclaration = (node: ts.Node) => {
      if (!ts.isImportDeclaration(node)) {
        return ts.visitEachChild(node, replaceDeclaration, context);
      }
      const opts = gContext.transContext.getCompilerOptions();
      const moduleImports = gContext.moduleImports;
      const request = getModuleRequest(node.moduleSpecifier);
      const moduleImport = moduleImports[request];
      if (!moduleImport) {
        // 如果不需要替换，则直接返回原始node
        return node;
      }
      console.log('replace', moduleImport.request);
      switch (opts.module) {
        case ts.ModuleKind.CommonJS:
        case ts.ModuleKind.NodeNext:
        case ts.ModuleKind.UMD:
        case ts.ModuleKind.AMD:
        case ts.ModuleKind.Node16:
        case ts.ModuleKind.None:
          // TODO xx_1 命名能否完全保证和原始import生成后的命名保持一致?
          // 由于ts编译时会优化导出，为了保证运行时类型引用的标识符必须导出，
          // 所以这里统一替换成 const xx_1 = require('xx')
          return createRequireStatement(moduleImport.name, moduleImport.request);
        default:
          // ES模块规范
          return replaceToRuntimeImportDeclaration(node, typeChecker);
      }
    };

    const newRoot = ts.visitNode(rootNode, visitController) as ts.SourceFile;

    return ts.visitNode(newRoot, replaceDeclaration) as ts.SourceFile;
  };
}
