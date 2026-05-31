export default async function healthRoutes(app) {
  app.get("/health", async () => {
    return {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  });
}
