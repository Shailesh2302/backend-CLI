import { Hono } from "hono";
import routes from "./routes/index.js";

const app = new Hono();

console.log(`Framework: Hono`);
console.log(`Language: __LANG__`);
console.log(`Database: __DB_CHOICE__`);

app.route("/", routes);

export default app;
