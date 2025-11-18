#!/usr/bin/env node

const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

async function askQuestions() {
  return await inquirer.prompt([
    {
      type: "list",
      name: "database",
      message: "Choose database:",
      choices: ["PostgreSQL (Prisma)", "MongoDB (Mongoose)", "None"]
    }
  ]);
}

function exitWith(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

(async () => {
  const projectName = process.argv[2];
  const autoInstall = process.argv.includes("--install") || process.argv.includes("-i");

  if (!projectName) {
    exitWith("Usage: @rush18/node-backend <project-name> [--install|-i]");
  }

  const { database } = await askQuestions();

  const target = path.join(process.cwd(), projectName);
  if (fs.existsSync(target)) {
    exitWith(`Error: "${projectName}" already exists at ${target}`);
  }

  if (database === "PostgreSQL (Prisma)") {
  console.log("Installing Prisma...");
  spawnSync("npm", ["install", "prisma", "@prisma/client"], { cwd: target, stdio: "inherit" });

  console.log("Initializing Prisma...");
  spawnSync("npx", ["prisma", "init"], { cwd: target, stdio: "inherit" });
}

if (database === "MongoDB (Mongoose)") {
  console.log("Installing Mongoose...");
  spawnSync("npm", ["install", "mongoose"], { cwd: target, stdio: "inherit" });
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
      content = content.replace(/__PROJECT_NAME__/g, projectName);
      content = content.replace(/__DB_CHOICE__/g, database);
      fs.writeFileSync(dest, content, { mode: stat.mode });
    }
  }

  try {
    copyRecursive(templateDir, target);
    console.log(`Project "${projectName}" created at ${target}`);
  } catch (err) {
    exitWith("Failed to copy template: " + err.message);
  }

  console.log(`\nSelected Database: ${database}\n`);
  console.log(`Next steps:
  cd ${projectName}
  npm install
  npm run dev
  `);

  if (autoInstall) {
    console.log("Running npm install for you...");
    const res = spawnSync("npm", ["install"], { cwd: target, stdio: "inherit" });
    if (res.status !== 0) {
      console.error("npm install failed. Run 'npm install' manually.");
      process.exit(1);
    } else {
      console.log("npm install finished.");
    }
  }
})();
