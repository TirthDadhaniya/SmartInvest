/**
 * Request Logger Middleware
 * ─────────────────────────
 * Logs every incoming HTTP request with timing, status, and user context.
 * Designed for multi-user environments — each log line includes the
 * authenticated user's ID (if available) so requests can be traced
 * per-user even under concurrent load.
 *
 * Log format:
 *   [2026-04-24T10:00:00.000Z] POST /api/investments | user:64a... | 201 | 42ms
 *
 * Usage:
 *   const { requestLogger } = require("./middleware/requestLogger");
 *   app.use(requestLogger);    // Mount BEFORE routes
 */

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Capture the original end() so we can hook into response completion
  const originalEnd = res.end;

  res.end = function (...args) {
    const duration = Date.now() - start;
    const userId = req.user?._id || "anon";
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl || req.url;
    const status = res.statusCode;

    // Color-code by status range for console readability
    const statusTag =
      status >= 500
        ? `\x1b[31m${status}\x1b[0m`  // red   — server error
        : status >= 400
          ? `\x1b[33m${status}\x1b[0m`  // yellow — client error
          : `\x1b[32m${status}\x1b[0m`; // green  — success

    console.log(
      `[${timestamp}] ${method} ${url} | user:${userId} | ${statusTag} | ${duration}ms`
    );

    originalEnd.apply(res, args);
  };

  next();
};

module.exports = { requestLogger };
