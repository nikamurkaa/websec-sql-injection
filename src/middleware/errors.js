function errorResponse(res, status, code, message, details) {
  const body = {
    error: {
      code,
      message
    }
  };

  if (details) {
    body.error.details = details;
  }

  return res.status(status).json(body);
}

function notFoundHandler(req, res) {
  return errorResponse(res, 404, 'NOT_FOUND', 'Endpoint not found.');
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.code === 'SQLITE_ERROR') {
    return errorResponse(res, 400, 'SQL_ERROR', 'The SQL query could not be executed.');
  }

  return errorResponse(res, 500, 'INTERNAL_ERROR', 'Unexpected server error.');
}

module.exports = {
  errorResponse,
  notFoundHandler,
  errorHandler
};
