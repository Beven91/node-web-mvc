// 用于launch.json 调试
const { register } = require('ts-node');
const path = require('path');
register({
  project: path.join(__dirname, '../tsconfig.json'),
  transpileOnly: false,
});
