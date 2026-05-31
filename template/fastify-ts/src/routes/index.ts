import { FastifyInstance } from "fastify";
import healthRoutes from "./health.js";

export default async function routes(app: FastifyInstance) {
  await app.register(healthRoutes);

  app.get("/", async () => {
    return {
      message: `Welcome to __PROJECT_NAME__ (Fastify TS)`,
      database: "__DB_CHOICE__",
    };
  });
}
