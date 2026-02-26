export const notFound = (req, res, next) => {
  res.status(404).json({
    status: "error",
    message: "Resource not found",
  });
};

export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal server error";

  if (process.env.NODE_ENV !== "test") {
    // Log only outside tests to keep console clean
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({
    status: "error",
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
