import express from "express";
import createError from "http-errors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import indexRouter from "./routes/index.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

console.log(`Database selected: __DB_CHOICE__`);

app.use("/", indexRouter);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

export default app;
