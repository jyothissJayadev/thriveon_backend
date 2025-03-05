const notFoundMiddleware = (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route does not exist",
  });
};

export default notFoundMiddleware;
