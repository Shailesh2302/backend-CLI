# 🚀 Node Backend CLI

A modern, flexible, open-source backend project generator. Create full backend applications in **seconds**, powered by your choice of **Express**, **Fastify**, **Hono**, or **NestJS**.

---

## 📦 Create a Project

```bash
npx @rush18/node-backend my-app
```

You will be prompted to choose:

* Language → TypeScript / JavaScript
* Framework → Express / Fastify / Hono / NestJS
* Database → Prisma / Mongoose / None
* Extras → Docker Support / Prettier + ESLint

---

## 📁 Project Structure

```
my-app/
 ├── src/
 │   ├── routes/
 │   ├── controllers/
 │   ├── middleware/
 │   ├── config/
 │   ├── app.(ts|js)
 │   └── server.(ts|js)
 ├── package.json
 ├── tsconfig.json
 ├── Dockerfile
 ├── docker-compose.yml
 ├── .prettierrc
 ├── .eslintrc.json
 ├── .eslintignore
 └── README.md
```

---

## 🛠 Built With

* Node.js
* Express / Fastify / Hono / NestJS
* Prisma / Mongoose
* TypeScript / JavaScript (ESM)
* Docker
* ESLint + Prettier

---

## ▶️ Run the Project

```bash
cd my-app
npm install
npm run dev
```

For NestJS:

```bash
npm run start:dev
```

---

## 🐳 Docker Support

If selected, the CLI generates:

* `Dockerfile`
* `docker-compose.yml`

Run:

```bash
docker compose up --build
```

---

## ✨ ESLint + Prettier

If enabled, you get:

* `.eslintrc.json`
* `.prettierrc`
* `.eslintignore`

Run lint:

```bash
npm run lint
```

---

## 📤 Deployment

### Node

```bash
npm run build
npm start
```

### Docker

```bash
docker compose up -d
```

---

## 🧭 Roadmap

* Auth templates
* CRUD module generator
* Swagger/OpenAPI generation
* Plugin system

---

## 📝 License

MIT © 2024 @rush18

---

## ⭐ Support

If you find this project useful, please give it a **star** ⭐ on GitHub!
