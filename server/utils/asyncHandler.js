/**
 * Wraps an async route handler and forwards any thrown errors
 * to Express's next() so the global error handler catches them.
 * Eliminates repetitive try-catch blocks in controllers.
 *
 * @param {Function} fn - Async express route handler
 * @returns {Function}  - Wrapped handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
