import { verifyAccessToken } from '../utils/jwt.js';
import prisma from '../lib/prisma.js';

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');
    if (!token) {
      return res.status(401).json({ error: { message: 'ต้องเข้าสู่ระบบก่อน', code: 'UNAUTHENTICATED' } });
    }

    // SECURITY: Verify JWT and ensure the user still exists before allowing access.
    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user) {
      return res.status(401).json({ error: { message: 'สิทธิ์ไม่ถูกต้อง', code: 'UNAUTHENTICATED' } });
    }
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: { message: 'สิทธิ์ไม่ถูกต้อง', code: 'UNAUTHENTICATED' } });
  }
}
