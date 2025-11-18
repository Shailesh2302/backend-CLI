import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: `Hello from __PROJECT_NAME__ (JavaScript - ES Modules)`,
    database: "__DB_CHOICE__",
  });
});

export default router;
