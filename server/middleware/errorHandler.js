import { sendError } from "../utils/response.js";

/**
 * Global error-handling middleware.
 * Must be registered LAST in the Express middleware chain (4 arguments).
 *
 * Handles:
 *  - Multer errors (file upload validation)
 *  - Generic application errors
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path} →`, err);

  // Multer-specific errors (e.g. file size limit, unexpected field)
  if (err.name === "MulterError") {
    return sendError(res, "UploadError", err.message, 400);
  }

  // Validation errors (e.g. thrown manually with status 400)
  if (err.statusCode) {
    return sendError(res, err.name || "RequestError", err.message, err.statusCode);
  }

  // Fallback: unexpected server error
  return sendError(
    res,
    "InternalServerError",
    err.message || "An unexpected error occurred",
    500
  );
};

export default errorHandler;
