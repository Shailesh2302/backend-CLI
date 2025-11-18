import app from "./app";

const port = process.env.PORT || 3000;

console.log("Database selected: __DB_CHOICE__");

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
