// Express 4 does not catch rejected promises thrown inside async route
// handlers - an error there becomes an unhandled rejection that crashes
// the whole process (this is what took the app down under a missing
// JWT_SECRET: the DB insert succeeded, then jwt.sign() threw, and there
// was nothing to catch it). Wrapping every async handler in this routes
// the error to Express's error-handling middleware instead.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
