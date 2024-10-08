import ts from 'typescript';
import enhanceTypeTransformer from './enhanceTypeTransformer';
import enhanceProdTransformer from './enhanceProdTransformer';

export function createTransformers(program: ts.Program, isProd: boolean) {
  const prodTransfermers: ts.CustomTransformers = {
    before: [
      (context)=> enhanceProdTransformer(context, program),
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
      // (context) => enhanceTypeAfterTranformer(context, program),
      ...(isProd ? prodTransfermers.after : []),
    ],
  };
  return transformers;
}
