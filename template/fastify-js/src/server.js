import app from "./app.js";
import { config } from "./config/index.js";

const start = async () => {
  try {
    await app.listen({ port: config.port, host: "0.0.0.0" });
    console.log(`Server running at http://localhost:${config.port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
