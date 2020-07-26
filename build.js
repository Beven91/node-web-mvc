const path = require('path');
const fs = require('fs-extra');

const assets = [
  'src/swagger/swagger-ui',
];

const tasks = [
  clean,
  copy,
];

function clean() {
  console.log('Clean dist');
  fs.removeSync(path.resolve('dist'));
}

function copy() {
  assets.forEach((dir) => {
    const from = path.resolve(dir);
    const dest = path.resolve('dist/' + dir);
    console.log('Copy ', dir);
    fs.copySync(from, dest);
  });
}

tasks.forEach((handler) => handler());
