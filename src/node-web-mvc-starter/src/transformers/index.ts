import ts from 'typescript';
import enhanceTypeTransformer from './enhanceTypeTransformer';
import removeHotUpdateTransformer from './removeHotUpdateTransformer';

export function createTransformers(program: ts.Program, isProd: boolean) {
  const prodTransfermers: ts.CustomTransformers = {
    before: [
      (context)=> removeHotUpdateTransformer(context, program),
    ],
    after: [],
  };

  const transformers: ts.CustomTransformers = {
    // 编译前转换器
    before: [
      (context) => enhanceTypeTransformer(context, program),
      ...(isProd ? prodTransfermers.before : []),
    ],
    // 编译后转换器
    after: [
      ...(isProd ? prodTransfermers.after : []),
    ],
  };
  return transformers;
}
