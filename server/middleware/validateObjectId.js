import mongoose from 'mongoose';

export function validateObjectId(...params) {
  return (req, res, next) => {
    for (const param of params) {
      if (!mongoose.isValidObjectId(req.params[param])) {
        return res.status(400).json({ error: 'Invalid id' });
      }
    }
    next();
  };
}
