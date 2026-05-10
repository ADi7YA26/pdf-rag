/**
 * Standardized API response helpers.
 * All responses follow the shape:
 *   Success: { success: true,  data: {...}, message: "" }
 *   Error:   { success: false, error: "Name", message: "Detail" }
 */

/**
 * Send a successful response.
 * @param {import('express').Response} res
 * @param {object} data       - Payload to return under `data`
 * @param {string} message    - Human-readable success message
 * @param {number} statusCode - HTTP status code (default 200)
 */
export const sendSuccess = (res, data = {}, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {string} errorName  - Short error identifier (e.g. "ValidationError")
 * @param {string} message    - Detailed error message
 * @param {number} statusCode - HTTP status code (default 500)
 */
export const sendError = (res, errorName = "InternalServerError", message = "Something went wrong", statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error: errorName,
    message,
  });
};
