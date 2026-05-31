import "dotenv/config";

export const config = {
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || "development",
  isDev: (process.env.NODE_ENV || "development") === "development",
  database: "__DB_CHOICE__",
};
