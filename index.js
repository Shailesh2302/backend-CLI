#!/usr/bin/env node

const figlet = require("figlet");
const chalk = require("chalk");
const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

console.log(
  chalk.cyan(
    figlet.textSync("Node Backend CLI", {
      horizontalLayout: "default",
      verticalLayout: "default"
    })
  )
);

async function askQuestions() {
  return await inquirer.prompt([
    {
      type: "list",
      name: "language",
      message: "Choose language:",
      choices: ["TypeScript", "JavaScript"]
    },
    {
      type: "list",
      name: "framework",
      message: "Choose framework:",
      choices: ["Express", "Fastify", "Hono", "NestJS"]
    },
    {
      type: "list",
      name: "database",
      message: "Choose database:",
      choices: ["PostgreSQL (Prisma)", "MongoDB (Mongoose)", "None"]
    },
    {
      type: "checkbox",
      name: "extras",
      message: "Add extra features:",
      choices: ["Docker Support", "Prettier + ESLint"]
    }
  ]);
}

function exitWith(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

(async () => {
  const projectName = process.argv[2];
  const autoInstall =
    process.argv.includes("--install") || process.argv.includes("-i");

  if (!projectName) {
    exitWith("Usage: @rush18/node-backend <project-name> [--install|-i]");
  }

  const { language, framework, database, extras } = await askQuestions();

  const target = path.join(process.cwd(), projectName);
  if (fs.existsSync(target)) {
    exitWith(`Error: "${projectName}" already exists at ${target}`);
  }

  if (framework === "NestJS") {
    console.log("Installing NestJS CLI...");
    spawnSync("npm", ["install", "-g", "@nestjs/cli"], { stdio: "inherit" });

    console.log("Creating NestJS project...");
    spawnSync("nest", ["new", projectName, "--skip-git"], { stdio: "inherit" });

    const nestProjectPath = target;
    const mainFile = path.join(nestProjectPath, "src/main.ts");
    let mainContent = fs.readFileSync(mainFile, "utf8");

    mainContent = mainContent.replace(
      'await app.listen(3000);',
      `
console.log("Framework: NestJS");
console.log("Language: TypeScript");
console.log("Database: ${database}");
await app.listen(3000);
      `
    );

    fs.writeFileSync(mainFile, mainContent, "utf8");

    if (database === "PostgreSQL (Prisma)") {
      console.log("Adding Prisma to NestJS...");
      spawnSync("npm", ["install", "prisma", "@prisma/client"], {
        cwd: nestProjectPath,
        stdio: "inherit"
      });
      spawnSync("npx", ["prisma", "init"], {
        cwd: nestProjectPath,
        stdio: "inherit"
      });
    }

    if (database === "MongoDB (Mongoose)") {
      console.log("Adding Mongoose to NestJS...");
      spawnSync("npm", ["install", "@nestjs/mongoose", "mongoose"], {
        cwd: nestProjectPath,
        stdio: "inherit"
      });
    }

    if (extras.includes("Prettier + ESLint")) {
      spawnSync(
        "npm",
        [
          "install",
          "-D",
          "eslint",
          "prettier",
          "eslint-config-prettier",
          "eslint-plugin-prettier"
        ],
        { cwd: nestProjectPath, stdio: "inherit" }
      );

      fs.writeFileSync(
        path.join(nestProjectPath, ".prettierrc"),
        `
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2
}
`.trim()
      );

      fs.writeFileSync(
        path.join(nestProjectPath, ".eslintignore"),
        `
node_modules
dist
`.trim()
      );

      fs.writeFileSync(
        path.join(nestProjectPath, ".eslintrc.json"),
        `
{
  "env": {
    "node": true,
    "es2021": true
  },
  "extends": ["eslint:recommended", "plugin:prettier/recommended"],
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "rules": {}
}
`.trim()
      );
    }

    if (extras.includes("Docker Support")) {
      fs.writeFileSync(
        path.join(nestProjectPath, "Dockerfile"),
        `
FROM node:20

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["npm", "run", "start:dev"]
`.trim()
      );

      fs.writeFileSync(
        path.join(nestProjectPath, "docker-compose.yml"),
        `
version: "3.8"

services:
  app:
    build: .
    container_name: ${projectName}
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    command: npm run start:dev
`.trim()
      );
    }

    console.log(`\nProject "${projectName}" created successfully!`);
    console.log(`
Next steps:
  cd ${projectName}
  npm run start:dev
`);
    process.exit(0);
  }

  const templateDir =
    language === "TypeScript"
      ? path.join(__dirname, "template", framework.toLowerCase() + "-ts")
      : path.join(__dirname, "template", framework.toLowerCase() + "-js");

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
      content = content.replace(/__LANG__/g, language);
      content = content.replace(/__FRAMEWORK__/g, framework);
      fs.writeFileSync(dest, content, { mode: stat.mode });
    }
  }

  copyRecursive(templateDir, target);
  console.log(`Project "${projectName}" created at ${target}`);

  if (database === "PostgreSQL (Prisma)") {
    spawnSync("npm", ["install", "prisma", "@prisma/client"], {
      cwd: target,
      stdio: "inherit"
    });
    spawnSync("npx", ["prisma", "init"], {
      cwd: target,
      stdio: "inherit"
    });
  }

  if (database === "MongoDB (Mongoose)") {
    spawnSync("npm", ["install", "mongoose"], {
      cwd: target,
      stdio: "inherit"
    });
  }

  if (framework === "Fastify") {
    spawnSync("npm", ["install", "fastify"], {
      cwd: target,
      stdio: "inherit"
    });
  }

  if (framework === "Hono") {
    spawnSync("npm", ["install", "hono"], {
      cwd: target,
      stdio: "inherit"
    });
  }

  if (extras.includes("Docker Support")) {
    fs.writeFileSync(
      path.join(target, "Dockerfile"),
      `
FROM node:20

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
`.trim()
    );

    fs.writeFileSync(
      path.join(target, "docker-compose.yml"),
      `
version: "3.8"

services:
  app:
    build: .
    container_name: ${projectName}
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    command: npm run dev
`.trim()
    );
  }

  if (extras.includes("Prettier + ESLint")) {
    spawnSync(
      "npm",
      [
        "install",
        "-D",
        "eslint",
        "prettier",
        "eslint-config-prettier",
        "eslint-plugin-prettier"
      ],
      { cwd: target, stdio: "inherit" }
    );

    fs.writeFileSync(
      path.join(target, ".prettierrc"),
      `
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2
}
`.trim()
    );

    fs.writeFileSync(
      path.join(target, ".eslintignore"),
      `
node_modules
dist
`.trim()
    );

    fs.writeFileSync(
      path.join(target, ".eslintrc.json"),
      `
{
  "env": {
    "node": true,
    "es2021": true
  },
  "extends": ["eslint:recommended", "plugin:prettier/recommended"],
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "rules": {}
}
`.trim()
    );
  }

  console.log(`Selected Language: ${language}`);
  console.log(`Selected Database: ${database}`);

  console.log(`
Next steps:
  cd ${projectName}
  npm install
  npm run dev
`);

  if (autoInstall) {
    spawnSync("npm", ["install"], {
      cwd: target,
      stdio: "inherit"
    });
  }
})();
