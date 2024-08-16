import ts from 'typescript';
import enhanceTypeTransformer from './enhanceTypeTransformer';

export function createTransformers(program: ts.Program) {
  const transformers: ts.CustomTransformers = {
    // 编译前转换器
    before: [
      (context) => enhanceTypeTransformer(context, program),
    ],
    // 编译后转换器
    after: [],
  };
  return transformers;
}
