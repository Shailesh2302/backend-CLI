import { Router } from "express";
import healthRouter from "./health.js";

const router = Router();

router.use(healthRouter);

router.get("/", (_req, res) => {
  res.json({
    message: `Welcome to __PROJECT_NAME__ (Express JS)`,
    database: "__DB_CHOICE__",
  });
});

export default router;
