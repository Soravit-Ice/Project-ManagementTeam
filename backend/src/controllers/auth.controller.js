import { z } from 'zod';
import {
  registerUser,
  verifyEmail,
  resendOtp,
  loginUser,
  logoutUser,
  refreshSession,
  getProfile,
} from '../services/auth.service.js';
import { AppError } from '../utils/errors.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const resendSchema = z.object({
  email: z.string().email(),
});

export async function registerController(req, res) {
  const payload = registerSchema.parse(req.body);
  const user = await registerUser(payload);
  return res.status(201).json({ data: { user }, message: 'สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมล' });
}

export async function verifyEmailController(req, res) {
  const payload = verifySchema.parse(req.body);
  const user = await verifyEmail(payload);
  return res.json({ data: { user }, message: 'ยืนยันอีเมลสำเร็จ' });
}

export async function resendOtpController(req, res) {
  const payload = resendSchema.parse(req.body);
  const result = await resendOtp(payload);
  return res.json({ data: result, message: 'ส่งรหัสใหม่เรียบร้อยแล้ว' });
}

export async function loginController(req, res) {
  const payload = loginSchema.parse(req.body);
  const result = await loginUser({ ...payload, res });
  return res.json({ data: result, message: 'เข้าสู่ระบบสำเร็จ' });
}

export async function logoutController(req, res) {
  await logoutUser({ req, res });
  return res.json({ data: { ok: true }, message: 'ออกจากระบบแล้ว' });
}

export async function refreshController(req, res) {
  const result = await refreshSession({ req, res });
  if (!result?.accessToken) {
    return res.json({ data: { accessToken: null, user: null } });
  }
  return res.json({ data: result, message: 'ออก access token ใหม่แล้ว' });
}

export async function meController(req, res) {
  if (!req.user) {
    throw new AppError('ต้องเข้าสู่ระบบ', { status: 401, code: 'UNAUTHENTICATED' });
  }
  const user = await getProfile(req.user.id);
  return res.json({ data: { user } });
}
