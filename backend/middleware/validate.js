const formatValidationErrors = (issues) => {
  return issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
};

const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formatValidationErrors(result.error.issues),
      });
    }

    if (Object.prototype.hasOwnProperty.call(result.data, "body")) {
      req.body = result.data.body;
    }

    if (Object.prototype.hasOwnProperty.call(result.data, "params")) {
      req.params = result.data.params;
    }

    if (Object.prototype.hasOwnProperty.call(result.data, "query")) {
      req.query = result.data.query;
    }

    return next();
  };
};

module.exports = {
  validate,
};
