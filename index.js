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

function exitWith(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

function runSpawn(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  if (result.status !== 0) {
    exitWith(`Command failed: ${cmd} ${args.join(" ")}`);
  }
  return result;
}

function convertToCJS(code) {
  return code
    .replace(/import\s+(\w+),\s*\{\s*([\w,\s]+)\s*\}\s+from\s+['"](.+?)['"]/g, 'const $1 = require("$3");\nconst { $2 } = require("$3")')
    .replace(/import\s+\{\s*([\w,\s]+)\s*\}\s+from\s+['"](.+?)['"]/g, 'const { $1 } = require("$2")')
    .replace(/import\s+(\w+)\s+from\s+['"](.+?)['"]/g, 'const $1 = require("$2")')
    .replace(/import\s+['"](.+?)['"]/g, 'require("$1")')
    .replace(/require\("(.+?)\.js"\)/g, 'require("$1")')
    .replace(/export\s+default\s+async\s+function\s+(\w+)/g, 'module.exports = async function $1')
    .replace(/export\s+default\s+function\s+(\w+)/g, 'module.exports = function $1')
    .replace(/export\s+default\s+(\w+)/g, 'module.exports = $1')
    .replace(/export\s+const\s+/g, 'const ')
    .replace(/export\s+function\s+/g, 'function ')
    .replace(/export\s+interface\s+/g, 'interface ')
    .replace(/export\s+type\s+(\w+)/g, 'type $1')
    .replace(/export\s+\{([\s\S]*?)\}\s+from\s+['"](.+?)['"]/g, 'const {$1} = require("$2")')
    .replace(/^export\s+type\s+\{[\s\S]*?\}\s+from\s+['"].*?['"];?\s*$/gm, '')
    .replace(/^export\s+\{([\s\S]*?)\};?\s*$/gm, 'module.exports = {$1};');
}

function writeGitignore(target) {
  const content = `node_modules
dist
.env
*.log
.DS_Store`;
  fs.writeFileSync(path.join(target, ".gitignore"), content);
}

function writeReadme(target, { projectName, language, framework, database, extras }) {
  const content = `# ${projectName}

Generated with [@rush18/node-backend](https://github.com/Shailesh2302/backend-CLI)

## Stack

- **Language:** ${language}
- **Framework:** ${framework}
- **Database:** ${database}
${extras.length ? `- **Extras:** ${extras.join(", ")}` : ""}

## Run locally

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
npm start
\`\`\`

---

⭐ If you find this useful, [star the project on GitHub](https://github.com/Shailesh2302/backend-CLI)
`;
  fs.writeFileSync(path.join(target, "README.md"), content);
}

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
      name: "module",
      message: "Choose module system:",
      choices: ["ESM (import/export)", "CommonJS (require/module.exports)"]
    },
    {
      type: "list",
      name: "templateStyle",
      message: "Choose template style:",
      choices: ["Full (recommended)", "Simple"]
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
      choices: ["Docker Support", "Prettier + ESLint", "Testing (Vitest)"]
    }
  ]);
}

(async () => {
  const projectName = process.argv[2];
  const autoInstall =
    process.argv.includes("--install") || process.argv.includes("-i");
  const skipPrompts = process.argv.includes("--yes") || process.argv.includes("-y");

  if (!projectName) {
    exitWith("Usage: @rush18/node-backend <project-name> [--install|-i] [--yes|-y]");
  }

  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(projectName)) {
    exitWith(`Error: "${projectName}" is not a valid project name. Use letters, digits, hyphens, underscores, or dots.`);
  }

  const nodeMajor = parseInt(process.versions.node, 10);
  if (nodeMajor < 18) {
    exitWith(`Node.js v18+ is required (current: v${process.versions.node})`);
  }

  const defaults = {
    language: "TypeScript",
    module: "ESM (import/export)",
    templateStyle: "Full (recommended)",
    framework: "Express",
    database: "None",
    extras: []
  };

  const { language, module: moduleSystem, templateStyle, framework, database, extras } = skipPrompts
    ? defaults
    : await askQuestions();

  const target = path.join(process.cwd(), projectName);

  if (fs.existsSync(target)) {
    exitWith(`Error: "${projectName}" already exists.`);
  }

  if (framework === "NestJS") {
    runSpawn("npm", ["install", "-g", "@nestjs/cli"]);
    runSpawn("nest", ["new", projectName, "--skip-git"]);

    if (database === "PostgreSQL (Prisma)") {
      runSpawn("npm", ["install", "prisma", "@prisma/client"], { cwd: target });

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
      runSpawn("npm", ["install", "@nestjs/mongoose", "mongoose"], { cwd: target });
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
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["npm", "run", "start:dev"]
`.trim()
      );

      fs.writeFileSync(
        path.join(nestPath, "docker-compose.yml"),
        `
services:
  app:
    build: .
    container_name: ${projectName}
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
    command: npm run start:dev
`.trim()
      );
    }

    writeGitignore(target);
    console.log("\nProject created successfully!");
    console.log(`\nNext steps:\n  cd ${projectName}\n  npm run start:dev\n`);
    process.exit(0);
  }

  const styleSuffix = templateStyle === "Simple" ? "-simple" : "";
  const templateDir =
    language === "TypeScript"
      ? path.join(__dirname, "template", framework.toLowerCase() + "-ts" + styleSuffix)
      : path.join(__dirname, "template", framework.toLowerCase() + "-js" + styleSuffix);

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

      if (moduleSystem === "CommonJS (require/module.exports)") {
        content = convertToCJS(content);
      }

      fs.writeFileSync(dest, content, { mode: stat.mode });
    }
  }

  copyRecursive(templateDir, target);

  const pkgPath = path.join(target, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

  if (moduleSystem === "CommonJS (require/module.exports)") {
    pkg.type = "commonjs";
  } else {
    delete pkg.type;
    pkg.type = "module";
  }

  if (database === "PostgreSQL (Prisma)") {
    pkg.dependencies["@prisma/client"] = "latest";
    pkg.devDependencies["prisma"] = "latest";
  }

  if (extras.includes("Prettier + ESLint") && !pkg.scripts?.lint) {
    pkg.scripts = { ...pkg.scripts, lint: "eslint src/" };
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  runSpawn("npm", ["install"], { cwd: target });

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
    runSpawn("npm", ["install", "mongoose"], { cwd: target });
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
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["npm", "run", "dev"]
`.trim()
      );

      fs.writeFileSync(
        path.join(target, "docker-compose.yml"),
        `
services:
  app:
    build: .
    container_name: ${projectName}
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
    command: npm run dev
`.trim()
      );
    }

  if (extras.includes("Prettier + ESLint")) {
    runSpawn("npm", ["install", "-D", "eslint", "prettier", "eslint-config-prettier", "eslint-plugin-prettier"], { cwd: target });

    fs.writeFileSync(
      path.join(target, ".prettierrc"),
      `{"singleQuote": true, "semi": true, "tabWidth": 2}`
    );

    fs.writeFileSync(
      path.join(target, ".eslintignore"),
      `node_modules\ndist`
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

  if (extras.includes("Testing (Vitest)")) {
    runSpawn("npm", ["install", "-D", "vitest"], { cwd: target });

    pkg.scripts = {
      ...pkg.scripts,
      test: "vitest run",
      "test:watch": "vitest",
    };

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

    const testDir = path.join(target, "src", "__tests__");
    fs.mkdirSync(testDir, { recursive: true });

    const testExt = language === "TypeScript" ? "ts" : "js";

    fs.writeFileSync(
      path.join(testDir, `app.${testExt}`),
      `import { describe, it, expect } from "vitest";

describe("app", () => {
  it("should pass a basic test", () => {
    expect(1 + 1).toBe(2);
  });
});
`
    );

    if (language === "TypeScript") {
      fs.writeFileSync(
        path.join(target, "vitest.config.ts"),
        `import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
});
`
      );
    }
  }

  writeGitignore(target);
  writeReadme(target, { projectName, language, framework, database, extras });

  const deps = Object.keys(pkg.dependencies).length;
  const devDeps = Object.keys(pkg.devDependencies || {}).length;

  console.log(chalk.green("\n✓ Project created successfully!"));
  console.log(chalk.dim("─".repeat(40)));
  console.log(`  Language:     ${language}`);
  console.log(`  Module:       ${moduleSystem}`);
  console.log(`  Style:        ${templateStyle}`);
  console.log(`  Framework:    ${framework}`);
  console.log(`  Database:     ${database}`);
  console.log(`  Extras:       ${extras.length ? extras.join(", ") : "none"}`);
  console.log(`  Dependencies: ${deps} prod, ${devDeps} dev`);
  console.log(chalk.dim("─".repeat(40)));
  console.log(chalk.cyan(`\nNext steps:`));
  console.log(`  cd ${projectName}`);
  console.log(`  npm run dev\n`);
  console.log(chalk.dim(`⭐ Star on GitHub: https://github.com/Shailesh2302/backend-CLI\n`));
})();
