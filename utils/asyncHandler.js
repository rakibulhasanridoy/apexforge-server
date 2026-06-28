// Wraps async route handlers so thrown errors are forwarded to Express's
// error middleware instead of causing an unhandled-promise-rejection crash.
// Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
