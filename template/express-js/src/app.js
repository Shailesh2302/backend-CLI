import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";

import router from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/index.js";
import { config } from "./config/index.js";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

console.log(`Framework: Express`);
console.log(`Language: __LANG__`);
console.log(`Database: __DB_CHOICE__`);

app.use("/", router);

app.use(notFound);
app.use(errorHandler);

export default app;
