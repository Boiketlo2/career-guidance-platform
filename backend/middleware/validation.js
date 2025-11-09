import { body, param, query, validationResult } from 'express-validator';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// ============================
// 🔹 STUDENT MODULE VALIDATIONS
// ============================
export const validateStudentRegistration = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Name is required').trim().isLength({ min: 2, max: 100 }),
  handleValidationErrors
];

export const validateStudentUpdate = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  handleValidationErrors
];

export const validateApplication = [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('courseId').notEmpty().withMessage('Course ID is required'),
  body('institutionId').notEmpty().withMessage('Institution ID is required'),
  body('personalStatement').optional().trim().isLength({ max: 500 }),
  handleValidationErrors
];

export const validateJobApplication = [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('jobId').notEmpty().withMessage('Job ID is required'),
  handleValidationErrors
];

export const validateWorkExperience = [
  body('company').notEmpty().withMessage('Company name is required').trim().isLength({ min: 2, max: 100 }),
  body('position').notEmpty().withMessage('Position is required').trim().isLength({ min: 2, max: 100 }),
  body('startDate').notEmpty().isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  body('description').optional().trim().isLength({ max: 500 }),
  body('isCurrent').optional().isBoolean(),
  handleValidationErrors
];

export const validateDocumentUpload = [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('documentType').isIn(['transcript', 'certificate', 'other']).withMessage('Invalid document type'),
  body('documentName').notEmpty().trim().isLength({ min: 2, max: 100 }),
  body('fileUrl').optional().isURL().withMessage('File URL must be a valid URL'),
  handleValidationErrors
];

// ============================
// 🔹 USER VALIDATIONS
// ============================
export const validateUserRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['student', 'company', 'institution', 'admin']),
  handleValidationErrors
];

export const validateUserLogin = [
  body('token').notEmpty().withMessage('Firebase token is required'),
  handleValidationErrors
];

// ============================
// 🔹 INSTITUTION / FACULTY / COURSE VALIDATIONS
// ============================
export const validateInstitution = [
  body('name').notEmpty().withMessage('Institution name is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('type').notEmpty().withMessage('Type is required'),
  handleValidationErrors
];

export const validateFaculty = [
  body('name').notEmpty().withMessage('Faculty name is required'),
  handleValidationErrors
];

export const validateCourse = [
  body('name').notEmpty().withMessage('Course name is required'),
  body('description').optional().isString(),
  body('requirements').optional().isArray(),
  body('duration').optional().isString(),
  body('credits').optional().isInt({ min: 0 }),
  handleValidationErrors
];

// ============================
// 🔹 COMPANY / JOB VALIDATIONS
// ============================
export const validateCompany = [
  body('name').notEmpty().withMessage('Company name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').optional().isLength({ min: 6 }),
  handleValidationErrors
];

export const validateJob = [
  body('title').notEmpty().withMessage('Job title is required'),
  body('description').notEmpty().withMessage('Job description is required'),
  body('location').notEmpty().withMessage('Job location is required'),
  body('companyId').notEmpty().withMessage('Company ID is required'),
  handleValidationErrors
];

// ============================
// 🔹 PARAM & QUERY VALIDATIONS
// ============================
export const validateId = [
  param('id').notEmpty().withMessage('ID parameter is required'),
  handleValidationErrors
];

export const validateStudentId = [
  param('studentId').notEmpty().withMessage('Student ID parameter is required'),
  handleValidationErrors
];

export const validateDocumentType = [
  query('type').optional().isIn(['transcript', 'certificate', 'all']),
  handleValidationErrors
];

// ============================
// 🔹 INSTITUTION ROUTE VALIDATIONS (NEW - SYNCHRONIZED WITH ROUTES)
// ============================
export const validateInstitutionId = [
  param('institutionId').notEmpty().withMessage('Institution ID parameter is required'),
  handleValidationErrors
];

export const validateApplicationId = [
  param('applicationId').notEmpty().withMessage('Application ID parameter is required'),
  handleValidationErrors
];