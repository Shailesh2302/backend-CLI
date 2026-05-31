# Node Backend CLI

A modern, flexible, open-source backend project generator. Create full backend applications in seconds, powered by your choice of **Express**, **Fastify**, **Hono**, or **NestJS**.

⭐ [Star on GitHub](https://github.com/Shailesh2302/backend-CLI)

---

## Quick Start

```bash
npx @rush18/node-backend my-app
```

You will be prompted to choose:

- **Language** → TypeScript / JavaScript
- **Module System** → ESM (import/export) / CommonJS (require/module.exports)
- **Template Style** → Full (modern) / Simple (classic)
- **Framework** → Express / Fastify / Hono / NestJS
- **Database** → PostgreSQL (Prisma) / MongoDB (Mongoose) / None
- **Extras** → Docker Support / Prettier + ESLint / Testing (Vitest)

### Skip prompts

```bash
npx @rush18/node-backend my-app --yes
```

Use `--install` or `-i` to auto-install dependencies:

```bash
npx @rush18/node-backend my-app --install
```

---

## Template Styles

### Full (recommended)

Modern architecture with config, middleware, utilities, types, and health check:

```
my-app/
 ├── src/
 │   ├── config/           → Environment configuration (dotenv)
 │   ├── middleware/        → Error handler, 404 handler
 │   ├── routes/
 │   │   ├── index.ts      → Route mounting
 │   │   └── health.ts     → GET /health endpoint
 │   ├── utils/            → Response helpers (success/error)
 │   ├── types/            → Shared TypeScript types
 │   ├── app.(ts|js)       → App setup (CORS, middleware, routes)
 │   └── server.(ts|js)    → Server entry
 ├── .env.example
 ├── .gitignore
 └── package.json
```

### Simple

Minimal classic structure with just the essentials:

```
my-app/
 ├── src/
 │   ├── routes/
 │   ├── app.(ts|js)
 │   └── server.(ts|js)
 ├── .gitignore
 └── package.json
```

---

## Extras

| Feature | Description |
|---|---|
| **Docker Support** | Generates `Dockerfile` + `docker-compose.yml` with health checks |
| **Prettier + ESLint** | Linting and formatting setup with `lint` script |
| **Testing (Vitest)** | Vitest config + sample test + `test` / `test:watch` scripts |

---

## Run the Project

```bash
cd my-app
npm run dev
```

For NestJS:

```bash
npm run start:dev
```

### Tests (if selected)

```bash
npm test
```

### Lint (if selected)

```bash
npm run lint
```

---

## Docker

```bash
docker compose up --build
```

Generated Docker files include a health check against `/health`.

---

## License

MIT © 2024 [@rush18](https://github.com/Shailesh2302)

---

⭐ If you find this project useful, please [star it on GitHub](https://github.com/Shailesh2302/backend-CLI)!
