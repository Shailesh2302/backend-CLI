import app from "./app.js";

const port = Number(process.env.PORT) || 3000;

console.log(`Server running at http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch
};
