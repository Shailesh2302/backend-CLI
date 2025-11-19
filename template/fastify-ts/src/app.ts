import Fastify from "fastify";

const app = Fastify();

console.log(`Framework: Fastify`);
console.log(`Language: __LANG__`);
console.log(`Database: __DB_CHOICE__`);

app.get("/", async () => {
  return {
    message: `Welcome to __PROJECT_NAME__ (Fastify TS)`,
    database: "__DB_CHOICE__"
  };
});

export default app;
