import { Hono } from "hono";

const routes = new Hono();

routes.get("/", (c) =>
  c.json({
    message: `Welcome to __PROJECT_NAME__ (Hono TS)`,
    database: "__DB_CHOICE__"
  })
);

export default routes;
