import { serve } from "@hono/node-server";
import app from "./app.js";
import { config } from "./config/index.js";

serve({ fetch: app.fetch, port: config.port }, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});
