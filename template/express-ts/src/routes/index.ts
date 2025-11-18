import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: `Welcome to __PROJECT_NAME__ (Express TS)`,
    database: "__DB_CHOICE__"
  });
});

export default router;
