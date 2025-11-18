import { FastifyInstance } from "fastify";

export default async function routes(app: FastifyInstance) {
  app.get("/", async () => {
    return {
      message: `Welcome to __PROJECT_NAME__ (Fastify TS)`,
      database: "__DB_CHOICE__"
    };
  });
}
