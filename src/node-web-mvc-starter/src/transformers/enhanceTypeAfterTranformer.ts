import ts, { TransformationContext } from 'typescript';
import { ExtTransformationContext, GenerateContext, getModuleRequest, ModuleImport } from './helper';

function createRuntimeTypeImportIdentifiers(context: TransformationContext, moduleImports: GenerateContext['moduleImports']) {
  const importStatements: ts.Statement[] = [];
  const opts = context.getCompilerOptions();
  const createImportNode = (moduleImport: ModuleImport) => {
    switch (opts.module) {
      case ts.ModuleKind.CommonJS:
      case ts.ModuleKind.NodeNext:
      case ts.ModuleKind.UMD:
      case ts.ModuleKind.AMD:
      case ts.ModuleKind.Node16:
      case ts.ModuleKind.None:
        return ts.factory.createVariableStatement(
          undefined,
          ts.factory.createVariableDeclarationList(
            [
              ts.factory.createVariableDeclaration(
                moduleImport.name,
                undefined,
                undefined,
                ts.factory.createCallExpression(
                  ts.factory.createIdentifier('require'),
                  undefined,
                  [ ts.factory.createStringLiteral(moduleImport.request) ]
                )
              ),
            ],
            ts.NodeFlags.Const
          )
        );
      default:
        const declaration = ts.factory.createImportDeclaration(
          undefined,
          ts.factory.createImportClause(
            false,
            moduleImport.default?.identifier,
            ts.factory.createNamedImports(
              moduleImport.identifiers.map((item) => ts.factory.createImportSpecifier(false, undefined, item.identifier))
            )
          ),
          ts.factory.createStringLiteral(moduleImport.request),
        );
        return declaration;
    }
  };
  Object.keys(moduleImports).forEach((id) => {
    const moduleImport = moduleImports[id];
    if (moduleImport?.identifiers?.length > 0 || moduleImport.default) {
      importStatements.push(createImportNode(moduleImport));
    }
  });
  return importStatements;
}

export default function enhancedTypeAfterTranformer(context: ExtTransformationContext, program: ts.Program) {
  return (sourceFile: ts.SourceFile) => {
    const moduleImports = context.runtimeTypeModuleImports;
    const visitClearn = (node) => {
      if (ts.isImportDeclaration(node)) {
        // ES模块
        const moduleImport = moduleImports[getModuleRequest(node.moduleSpecifier)];
        if (!moduleImport) return node;
        if (!moduleImport.default && node.importClause.name) {
          moduleImport.default = { name: node.importClause.name.getText(), identifier: node.importClause.name };
        }
        // 合并标识符
        node.importClause.namedBindings?.forEachChild?.((child)=> {
          const importName = (child as ts.NamedDeclaration).name.getText();
          if (!moduleImport.allKeys[importName]) {
            moduleImport.identifiers.push({ name: importName, identifier: ts.factory.createIdentifier(importName) });
          }
          return child;
        });
        // 移除当前导入，统一到后面追加
        return undefined;
      }
      // 非ES模块
      if (ts.isVariableDeclaration(node)) {
        const original = ts.getOriginalNode(node.name);
        if (ts.isImportDeclaration(original)) {
          const request = getModuleRequest(original.moduleSpecifier);
          // 如果当前import没有被优化，则从新增导入中删除
          delete moduleImports[request];
          return node;
        }
      }
      return ts.visitEachChild(node, visitClearn, context);
    };

    const newRoot = ts.visitNode(sourceFile, visitClearn) as ts.SourceFile;

    return ts.factory.updateSourceFile(
      newRoot,
      [
        ...createRuntimeTypeImportIdentifiers(context, moduleImports),
        ...newRoot.statements,
      ],
      newRoot.isDeclarationFile,
      newRoot.referencedFiles,
      newRoot.typeReferenceDirectives,
      newRoot.hasNoDefaultLib,
      newRoot.libReferenceDirectives
    ) as ts.SourceFile;
  };
}
