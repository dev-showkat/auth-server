export const errorHandler = (err, req, res, next) => {
  const { message, statusCode, stack } = err;
  console.error(stack);
  res.status(statusCode || 500).json({
    error: message || "Internal Server Error",
  });
};
