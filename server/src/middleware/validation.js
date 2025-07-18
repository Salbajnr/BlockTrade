
import { ApiError } from './error.middleware.js';

export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return next(new ApiError(errorMessage, 400));
    }
    
    next();
  };
};
