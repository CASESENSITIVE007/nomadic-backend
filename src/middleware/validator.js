import { body, param, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Auth validators
export const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Trip validators
export const createTripValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Trip name is required')
    .isLength({ max: 100 }).withMessage('Trip name cannot exceed 100 characters'),
  body('destination')
    .trim()
    .notEmpty().withMessage('Destination is required'),
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid date format'),
  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Invalid date format'),
  handleValidationErrors
];

// Expense validators
export const createExpenseValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required'),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('category')
    .optional()
    .isIn(['transport', 'food', 'accommodation', 'activities', 'shopping', 'other'])
    .withMessage('Invalid category'),
  handleValidationErrors
];

// Place validators
export const createPlaceValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Place name is required'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required'),
  body('location.coordinates.lat')
    .notEmpty().withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('location.coordinates.lng')
    .notEmpty().withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  handleValidationErrors
];

export default {
  handleValidationErrors,
  registerValidator,
  loginValidator,
  createTripValidator,
  createExpenseValidator,
  createPlaceValidator
};
