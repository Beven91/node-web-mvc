
import { register } from 'ts-node';
import path from 'path';
import { createTransformers } from '../transformers';

register({
  project: path.resolve(''),
  transpileOnly: false,
  transformers: (program) => {
    return createTransformers(program);
  },
});
