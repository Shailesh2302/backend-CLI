import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import createError from "http-errors";

import router from "./routes/index.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

console.log(`Framework: Express`);
console.log(`Language: __LANG__`);
console.log(`Database: __DB_CHOICE__`);

app.use("/", router);

app.use((req, res, next) => next(createError(404)));

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500).json({
    message: err.message,
    error: err,
  });
});

export default app;
