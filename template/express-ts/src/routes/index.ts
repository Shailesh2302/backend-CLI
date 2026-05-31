import { Router, Request, Response } from "express";
import healthRouter from "./health.js";

const router = Router();

router.use(healthRouter);

router.get("/", (_req: Request, res: Response) => {
  res.json({
    message: `Welcome to __PROJECT_NAME__`,
    database: "__DB_CHOICE__",
  });
});

export default router;
