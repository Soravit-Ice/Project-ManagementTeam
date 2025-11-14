export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        message: 'กรุณาเข้าสู่ระบบ',
        code: 'UNAUTHORIZED',
      },
    });
  }

  if (req.user.accountType !== 'ADMINISTRATOR') {
    return res.status(403).json({
      error: {
        message: 'ไม่มีสิทธิ์เข้าถึง',
        code: 'FORBIDDEN',
      },
    });
  }

  next();
};
