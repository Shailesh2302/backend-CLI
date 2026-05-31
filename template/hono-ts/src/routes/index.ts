import { Hono } from "hono";
import health from "./health.js";

const routes = new Hono();

routes.route("/", health);

routes.get("/", (c) => {
  return c.json({
    message: `Welcome to __PROJECT_NAME__ (Hono TS)`,
    database: "__DB_CHOICE__",
  });
});

export default routes;
