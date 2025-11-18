export default async function routes(app) {
  app.get("/", async () => {
    return {
      message: `Welcome to __PROJECT_NAME__ (Fastify JS)`,
      database: "__DB_CHOICE__"
    };
  });
}
