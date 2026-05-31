import Fastify from "fastify";
import cors from "@fastify/cors";
import routes from "./routes/index.js";
import { config } from "./config/index.js";

const app = Fastify({
  logger: config.isDev,
});

app.register(cors);

console.log(`Framework: Fastify`);
console.log(`Language: __LANG__`);
console.log(`Database: __DB_CHOICE__`);

app.register(routes);

export default app;
