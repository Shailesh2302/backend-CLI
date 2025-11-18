#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function exitWith(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

const projectName = process.argv[2];
const autoInstall = process.argv.includes("--install") || process.argv.includes("-i");

if (!projectName) {
  exitWith("Usage: create-mybackend <project-name> [--install|-i]");
}

const target = path.join(process.cwd(), projectName);
if (fs.existsSync(target)) {
  exitWith(`Error: "${projectName}" already exists at ${target}`);
}

const templateDir = path.join(__dirname, "template");

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    let content = fs.readFileSync(src, "utf8");
    // replace placeholders
    content = content.replace(/__PROJECT_NAME__/g, projectName);
    fs.writeFileSync(dest, content, { mode: stat.mode });
  }
}

try {
  copyRecursive(templateDir, target);
  console.log(`Project "${projectName}" created at ${target}`);
} catch (err) {
  exitWith("Failed to copy template: " + err.message);
}

console.log("\nNext steps:");
console.log(`  cd ${projectName}`);
console.log("  npm install");
console.log("  npm run dev\n");

if (autoInstall) {
  console.log("Running npm install for you (this may take a while)...");
  const res = spawnSync("npm", ["install"], { cwd: target, stdio: "inherit" });
  if (res.status !== 0) {
    console.error("npm install failed. Please run 'npm install' manually.");
    process.exit(1);
  } else {
    console.log("npm install finished.");
  }
}
