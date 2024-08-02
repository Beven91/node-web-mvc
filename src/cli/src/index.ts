import { tsNode } from './ts-node';
import { tsc } from './tsc';
import { program } from 'commander';
import fs from 'fs';

const argv = process.argv;

const pkg = JSON.parse(fs.readFileSync('package.json').toString('utf-8'));
// 默认参数
if (argv.length <= 2) {
  argv.push('-h');
}

program
  .version(pkg.version)
  .usage('node-web-starter [command] [options]');

program
  .command('dev <entry>')
  .action(tsNode)
  .description('dev server');

program
  .command('build')
  .action(tsc)
  .description('build server');

// 解析参数
program.parse(argv);
