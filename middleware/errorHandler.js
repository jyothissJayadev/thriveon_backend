// Error handling middleware
const errorHandlerMiddleware = (err, req, res, next) => {
  // Default error
  let customError = {
    statusCode: err.statusCode || 500,
    message: err.message || "Something went wrong, please try again later",
  };

  // Mongoose validation error
  if (err.name === "ValidationError") {
    customError.message = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
    customError.statusCode = 400;
  }

  // Mongoose duplicate key error
  if (err.code && err.code === 11000) {
    customError.message = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field`;
    customError.statusCode = 400;
  }

  // Mongoose cast error
  if (err.name === "CastError") {
    customError.message = `Invalid ${err.path}: ${err.value}`;
    customError.statusCode = 400;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    customError.message = "Invalid authentication token";
    customError.statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    customError.message = "Authentication token has expired";
    customError.statusCode = 401;
  }

  return res.status(customError.statusCode).json({
    success: false,
    error: customError.message,
  });
};

export default errorHandlerMiddleware;
