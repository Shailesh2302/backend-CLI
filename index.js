
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
      verticalLayout: "default",
    })
  )
);

async function askQuestions() {
  return await inquirer.prompt([
    {
      type: "list",
      name: "language",
      message: "Choose language:",
      choices: ["TypeScript", "JavaScript"],
    },
    {
      type: "list",
      name: "framework",
      message: "Choose framework:",
      choices: ["Express", "Fastify", "Hono", "NestJS"],
    },
    {
      type: "list",
      name: "database",
      message: "Choose database:",
      choices: ["PostgreSQL (Prisma)", "MongoDB (Mongoose)", "None"],
    },
    {
      type: "checkbox",
      name: "extras",
      message: "Add extra features:",
      choices: ["Docker Support", "Prettier + ESLint"],
    },
  ]);
}

function exitWith(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`Error running: ${command} ${args.join(" ")}`);
    process.exit(result.status);
  }
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
    run("npm", ["install", "-g", "@nestjs/cli"]);

    run("nest", ["new", projectName, "--skip-git"]);

    const nestPath = target;

    if (database === "PostgreSQL (Prisma)") {
      run("npm", ["install", "prisma", "@prisma/client"], nestPath);
      run("npx", ["prisma", "init"], nestPath);

      const configPath = path.join(nestPath, "prisma", "prisma.config.ts");
      if (fs.existsSync(configPath)) fs.unlinkSync(configPath);

      fs.writeFileSync(
        path.join(nestPath, "prisma", "schema.prisma"),
        `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String?
}
`.trim()
      );
    }

    if (database === "MongoDB (Mongoose)") {
      run("npm", ["install", "@nestjs/mongoose", "mongoose"], nestPath);
    }

    if (extras.includes("Docker Support")) {
      fs.writeFileSync(
        path.join(nestPath, "Dockerfile"),
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
        path.join(nestPath, "docker-compose.yml"),
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

    console.log(`
✔ Project "${projectName}" created successfully!
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
      fs.writeFileSync(dest, content);
    }
  }

  copyRecursive(templateDir, target);
  console.log(`Project "${projectName}" created at ${target}`);

  run("npm", ["install"], target);

  if (database === "PostgreSQL (Prisma)") {
    run("npm", ["install", "prisma", "@prisma/client"], target);
    run("npx", ["prisma", "init"], target);

    const configPath = path.join(target, "prisma", "prisma.config.ts");
    if (fs.existsSync(configPath)) fs.unlinkSync(configPath);

    fs.writeFileSync(
      path.join(target, "prisma", "schema.prisma"),
      `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String?
}
`.trim()
    );
  }

  if (database === "MongoDB (Mongoose)") {
    run("npm", ["install", "mongoose"], target);
  }


  if (framework === "Fastify") {
    run("npm", ["install", "fastify"], target);
  }

  if (framework === "Hono") {
    run("npm", ["install", "hono"], target);
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
    run(
      "npm",
      [
        "install",
        "-D",
        "eslint",
        "prettier",
        "eslint-config-prettier",
        "eslint-plugin-prettier",
      ],
      target
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
  "env": { "node": true, "es2021": true },
  "extends": ["eslint:recommended", "plugin:prettier/recommended"],
  "parserOptions": { "ecmaVersion": 2022, "sourceType": "module" },
  "rules": {}
}
`.trim()
    );
  }


  console.log(`
✔ Selected Language: ${language}
✔ Selected Framework: ${framework}
✔ Selected Database: ${database}

Next steps:
  cd ${projectName}
  npm run dev
`);
})();
