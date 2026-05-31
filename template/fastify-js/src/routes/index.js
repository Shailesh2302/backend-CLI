import healthRoutes from "./health.js";

export default async function routes(app) {
  await app.register(healthRoutes);

  app.get("/", async () => {
    return {
      message: `Welcome to __PROJECT_NAME__ (Fastify JS)`,
      database: "__DB_CHOICE__",
    };
  });
}
