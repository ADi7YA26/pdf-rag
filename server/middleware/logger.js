/**
 * Simple request logger middleware.
 * Logs method, path, and response time for every incoming request.
 */
const logger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
  });

  next();
};

export default logger;
