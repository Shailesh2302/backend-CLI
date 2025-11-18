import Fastify from "fastify";
import routes from "./routes/index.js";

const app = Fastify();

console.log(`Framework: Fastify`);
console.log(`Language: __LANG__`);
console.log(`Database: __DB_CHOICE__`);

app.register(routes);

export default app;
