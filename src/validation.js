// src/validation.js

/**
 * Checks an object of form data against a list of required field names.
 * Returns { isValid: boolean, emptyFields: string[] }
 */
function checkEmptyBoxes(data, requiredFields) {
  const emptyFields = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, emptyFields: requiredFields };
  }

  for (const field of requiredFields) {
    const value = data[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '')
    ) {
      emptyFields.push(field);
    }
  }

  return {
    isValid: emptyFields.length === 0,
    emptyFields,
  };
}

/**
 * Express middleware generator to reject requests with empty boxes.
 */
function requireNonEmptyBoxes(requiredFields) {
  return (req, res, next) => {
    // Support both POST body data and GET query parameters
    const inputData = Object.keys(req.body || {}).length > 0 ? req.body : req.query;
    const { isValid, emptyFields } = checkEmptyBoxes(inputData, requiredFields);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required boxes.',
        emptyFields,
      });
    }

    next();
  };
}

module.exports = { checkEmptyBoxes, requireNonEmptyBoxes };