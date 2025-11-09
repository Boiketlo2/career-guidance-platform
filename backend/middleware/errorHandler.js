/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error Stack:', err.stack);

  const error = { ...err };
  error.message = err.message;

  // Firebase Auth errors
  const firebaseErrors = {
    'auth/email-already-exists': { message: 'Email already exists', status: 400 },
    'auth/user-not-found': { message: 'User not found', status: 404 },
    'auth/invalid-email': { message: 'Invalid email address', status: 400 },
    'auth/weak-password': { message: 'Password should be at least 6 characters', status: 400 },
  };

  if (firebaseErrors[err.code]) {
    const { message, status } = firebaseErrors[err.code];
    return res.status(status).json({ success: false, error: message });
  }

  // Firestore errors
  if (err.code === 'not-found') {
    return res.status(404).json({ success: false, error: 'Resource not found' });
  }

  if (err.code === 'permission-denied') {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  // Validation and duplicate errors (future proofing)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ success: false, error: messages.join(', ') });
  }

  if (err.code === 11000) {
    return res.status(400).json({ success: false, error: 'Duplicate field value entered' });
  }

  if (err.name === 'CastError') {
    return res.status(404).json({ success: false, error: 'Invalid resource ID' });
  }

  // Default error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Async handler for wrapping controllers
 */
export const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default errorHandler;
