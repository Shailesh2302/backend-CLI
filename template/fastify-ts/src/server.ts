import app from "./app.js";



const port = Number(process.env.PORT) || 3000;

app.listen({ port: Number(port) }).then(() => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

