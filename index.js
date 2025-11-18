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

    if (database === "PostgreSQL (Prisma)") {
      spawnSync("npm", ["install", "prisma", "@prisma/client"], {
        cwd: nestProjectPath,
        stdio: "inherit"
      });

      const prismaDir = path.join(nestProjectPath, "prisma");
      if (!fs.existsSync(prismaDir)) fs.mkdirSync(prismaDir);

      fs.writeFileSync(
        path.join(prismaDir, "schema.prisma"),
        `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id     Int    @id @default(autoincrement())
  email  String @unique
  name   String?
}
`.trim()
      );

      fs.writeFileSync(
        path.join(nestProjectPath, ".env"),
        `DATABASE_URL="postgresql://user:password@localhost:5432/mydb"`
      );
    }

    if (database === "MongoDB (Mongoose)") {
      spawnSync("npm", ["install", "@nestjs/mongoose", "mongoose"], {
        cwd: nestProjectPath,
        stdio: "inherit"
      });
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

    console.log("\nProject created successfully!");
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
      content = content
        .replace(/__PROJECT_NAME__/g, projectName)
        .replace(/__DB_CHOICE__/g, database)
        .replace(/__LANG__/g, language)
        .replace(/__FRAMEWORK__/g, framework);
      fs.writeFileSync(dest, content, { mode: stat.mode });
    }
  }

  copyRecursive(templateDir, target);
  console.log(`Project "${projectName}" created at ${target}`);

  const pkgPath = path.join(target, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

  if (database === "PostgreSQL (Prisma)") {
    pkg.dependencies["@prisma/client"] = "latest";
    pkg.devDependencies["prisma"] = "latest";
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  console.log("Running npm install...");
  spawnSync("npm", ["install"], { cwd: target, stdio: "inherit" });

  if (framework === "Fastify") {
    spawnSync("npm", ["install", "fastify"], { cwd: target, stdio: "inherit" });
  }

  if (framework === "Hono") {
    spawnSync("npm", ["install", "hono"], { cwd: target, stdio: "inherit" });
  }

  if (database === "PostgreSQL (Prisma)") {
    const prismaDir = path.join(target, "prisma");
    if (!fs.existsSync(prismaDir)) fs.mkdirSync(prismaDir);

    fs.writeFileSync(
      path.join(prismaDir, "schema.prisma"),
      `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id     Int    @id @default(autoincrement())
  email  String @unique
  name   String?
}
`.trim()
    );

    fs.writeFileSync(
      path.join(target, ".env"),
      `DATABASE_URL="postgresql://user:password@localhost:5432/mydb"`
    );
  }

  if (database === "MongoDB (Mongoose)") {
    spawnSync("npm", ["install", "mongoose"], {
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

  console.log(`
Selected Language: ${language}
Selected Framework: ${framework}
Selected Database: ${database}

Next steps:
  cd ${projectName}
  npm run dev
`);
})();
