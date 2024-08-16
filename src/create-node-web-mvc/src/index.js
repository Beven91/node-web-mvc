#!/usr/bin/env node

const prompts = require('prompts');
const fs = require('fs');
const path = require('path');

async function main() {
  const response = await prompts(
    [
      {
        type: 'text',
        name: 'name',
        message: 'Enter project name',
        initial: path.basename(path.resolve('')),
        // validate: (v)=> !v.trim() ? 'Project name is required' : true
      },
      {
        type: 'select',
        name: 'type',
        message: 'Pick template',
        initial: 'standard',
        choices: [
          { title: 'Standard', value: 'standard' },
          // { title: 'Workspace', value: 'workspace' },
        ],
      },
    ]
  );

  const type = response.type || 'standard';
  const dir = path.join(__dirname, `../templates/${type}`);
  const targetDir = path.resolve(response.name);
  if (fs.existsSync(targetDir)) {
    throw new Error(`Target directory '${response.name}' already exists`)
  }
  copyFilesAndDirectories(dir, targetDir);
  updatePackageJson(response.name, targetDir);
  console.log(`cd ./${response.name}`)
  console.log(`npm install`)
  console.log(`npm start`)
  process.exit(0);
  
}

function updatePackageJson(name, targetDir) {
  const pkg = require(path.join(targetDir, 'package.json'));
  pkg.name = name;
  fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(pkg, null, 2));
}

function copyFilesAndDirectories(dir, targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file == 'node_modules') {
      continue;
    }
    const filePath = path.join(dir, file);
    const targetFilePath = path.join(targetDir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      fs.mkdirSync(targetFilePath, { recursive: true });
      copyFilesAndDirectories(filePath, targetFilePath);
    } else {
      fs.copyFileSync(filePath, targetFilePath);
    }
  }
}

main();