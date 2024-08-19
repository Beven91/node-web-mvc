import type { RuntimeOptions } from './build';
import { tsNode } from './runtime/ts-node';

export default function dev(options: RuntimeOptions) {
  tsNode(options.entry);
}
