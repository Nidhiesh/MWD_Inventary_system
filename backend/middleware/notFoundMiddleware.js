const notFoundMiddleware = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found - ${req.originalUrl}`
  });
};

module.exports = notFoundMiddleware;
