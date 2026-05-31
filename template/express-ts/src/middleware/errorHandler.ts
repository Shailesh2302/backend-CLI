import { Request, Response, NextFunction } from "express";
import { config } from "../config/index.js";

export interface HttpError extends Error {
  status?: number;
  statusCode?: number;
}

export function errorHandler(
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.status || err.statusCode || 500;

  res.status(status).json({
    success: false,
    error: {
      message: err.message || "Internal Server Error",
      status,
      ...(config.isDev && { stack: err.stack }),
    },
  });
}
