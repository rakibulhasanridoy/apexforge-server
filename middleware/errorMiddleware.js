// Central error handler — mounted last in index.js.
// All errors thrown inside asyncHandler-wrapped routes land here.
export const errorHandler = (err, req, res, next) => {
  console.error(`[${req.method} ${req.url}]`, err.message);

  // Mongoose: bad ObjectId (e.g. /classes/not-an-id)
  if (err.name === 'CastError')
    return res.status(400).json({ message: 'Invalid ID format' });

  // Mongoose: schema validation failed (required field missing, enum mismatch, etc.)
  if (err.name === 'ValidationError')
    return res.status(400).json({ message: err.message });

  // MongoDB: duplicate key — only the Favorite model has a unique index
  if (err.code === 11000)
    return res.status(400).json({ message: 'Already in favorites' });

  res.status(err.statusCode || 500).json({
    message: err.message || 'Something went wrong',
  });
};
