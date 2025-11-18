import app from "./app.js";

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await app.listen({ port });
    console.log(`Server running at http://localhost:${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
