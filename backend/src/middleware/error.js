import { ZodError } from 'zod';
import { AppError, isAppError } from '../utils/errors.js';

export function notFoundHandler(req, res) {
  return res.status(404).json({ error: { message: 'ไม่พบเส้นทางที่ร้องขอ', code: 'NOT_FOUND' } });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError) {
    return res.status(422).json({
      error: {
        message: 'ข้อมูลไม่ถูกต้อง',
        code: 'VALIDATION_ERROR',
        details: err.flatten().fieldErrors,
      },
    });
  }

  if (isAppError(err)) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    });
  }

  console.error('Unhandled error', err);
  return res.status(500).json({ error: { message: 'เกิดข้อผิดพลาดภายในระบบ', code: 'INTERNAL_SERVER_ERROR' } });
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export { AppError } from '../utils/errors.js';
