import { config } from "../config/index.js";

export function errorHandler(err, _req, res, _next) {
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
