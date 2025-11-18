import app from "./app.js";

const port = process.env.PORT || 3000;

console.log(`Selected Language: __LANG__`);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
