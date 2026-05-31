import { Hono } from "hono";
import { cors } from "hono/cors";
import routes from "./routes/index.js";

const app = new Hono();

console.log(`Framework: Hono`);
console.log(`Language: __LANG__`);
console.log(`Database: __DB_CHOICE__`);

app.use("*", cors());
app.route("/", routes);

app.notFound((c) => {
  return c.json({ success: false, error: "Not found" }, 404);
});

app.onError((err, c) => {
  console.error(err);
  return c.json({ success: false, error: "Internal Server Error" }, 500);
});

export default app;
