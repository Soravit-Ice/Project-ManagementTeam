import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import { env } from '../config/env.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateOtp, hashOtp, verifyOtp, buildOtpExpiry } from '../utils/otp.js';
import { renderEmailTemplate } from '../utils/email.js';
import { sendMail } from '../lib/mailer.js';
import { AppError } from '../utils/errors.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { checkOtpCooldown, markOtpSent, registerFailedLogin, resetLoginAttempts, isLoginLocked } from '../utils/rate.js';

const APP_NAME = env.MAIL_FROM?.split('<')[0]?.trim() || 'Project Auth';

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}

function buildRefreshExpiry() {
  const date = new Date();
  date.setDate(date.getDate() + env.REFRESH_TOKEN_TTL_DAYS);
  return date;
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}

async function createRefreshSession(userId, res) {
  const refreshId = crypto.randomUUID();
  const refreshToken = signRefreshToken({ sub: userId }, { jwtid: refreshId });
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: buildRefreshExpiry(),
    },
  });
  // SECURITY: refresh token issued only via httpOnly cookie to block JS access.
  setRefreshCookie(res, refreshToken);
  return refreshToken;
}

export async function registerUser({ email, password, name }) {
  const normalizedEmail = email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing && existing.verified) {
    throw new AppError('อีเมลนี้ถูกใช้งานแล้ว', { code: 'EMAIL_IN_USE', status: 409 });
  }

  const passwordHash = await hashPassword(password);
  let user;
  if (existing) {
    user = await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash, name, verified: false },
    });
  } else {
    user = await prisma.user.create({
      data: { email: normalizedEmail, passwordHash, name },
    });
  }

  await issueEmailVerificationOtp(user);
  return sanitizeUser(user);
}

async function issueEmailVerificationOtp(user) {
  const code = generateOtp(6);
  // SECURITY: persist only the OTP hash to keep the raw code out of storage.
  const codeHash = await hashOtp(code);

  await prisma.emailOtp.updateMany({
    where: { userId: user.id, purpose: 'VERIFY_EMAIL', consumed: false },
    data: { consumed: true },
  });

  await prisma.emailOtp.create({
    data: {
      userId: user.id,
      codeHash,
      expiresAt: buildOtpExpiry(),
      purpose: 'VERIFY_EMAIL',
    },
  });

  const html = await renderEmailTemplate('otp', {
    subject: 'ยืนยันอีเมลของคุณ',
    name: user.name || user.email,
    code,
    appName: APP_NAME,
    expiresMinutes: env.OTP_TTL_MINUTES,
  });

  const text = `รหัส OTP สำหรับ ${APP_NAME}: ${code} (หมดอายุใน ${env.OTP_TTL_MINUTES} นาที)`;

  await sendMail({
    to: user.email,
    subject: `[${APP_NAME}] รหัส OTP ยืนยันอีเมล`,
    html,
    text,
  });

  markOtpSent(user.email);
  return code;
}

export async function verifyEmail({ email, code }) {
  const normalizedEmail = email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    throw new AppError('ไม่พบบัญชีนี้', { status: 404, code: 'USER_NOT_FOUND' });
  }
  if (user.verified) {
    return sanitizeUser(user);
  }

  const record = await prisma.emailOtp.findFirst({
    where: {
      userId: user.id,
      purpose: 'VERIFY_EMAIL',
      consumed: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    throw new AppError('ไม่มีรหัส OTP ที่ใช้งานได้ กรุณาขอใหม่', { status: 400, code: 'OTP_NOT_FOUND' });
  }

  if (record.expiresAt < new Date()) {
    await prisma.emailOtp.update({ where: { id: record.id }, data: { consumed: true } });
    throw new AppError('รหัส OTP หมดอายุแล้ว', { status: 400, code: 'OTP_EXPIRED' });
  }

  const valid = await verifyOtp(record.codeHash, code);
  if (!valid) {
    throw new AppError('รหัส OTP ไม่ถูกต้อง', { status: 400, code: 'OTP_INVALID' });
  }

  // SECURITY: wrap verification + consume OTP atomically to prevent reuse.
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { verified: true } }),
    prisma.emailOtp.update({ where: { id: record.id }, data: { consumed: true } }),
  ]);

  return sanitizeUser({ ...user, verified: true });
}

export async function resendOtp({ email }) {
  const normalizedEmail = email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    throw new AppError('ไม่พบบัญชีนี้', { status: 404, code: 'USER_NOT_FOUND' });
  }
  if (user.verified) {
    throw new AppError('บัญชีนี้ยืนยันแล้ว', { status: 400, code: 'ALREADY_VERIFIED' });
  }

  const cooldown = checkOtpCooldown(normalizedEmail, env.OTP_COOLDOWN_SECONDS);
  if (!cooldown.allowed) {
    throw new AppError('ส่งรหัสบ่อยเกินไป', {
      status: 429,
      code: 'OTP_RATE_LIMITED',
      details: { retryAfterSeconds: cooldown.retryAfterSeconds },
    });
  }

  await issueEmailVerificationOtp(user);
  return { ok: true };
}

export async function loginUser({ email, password, res }) {
  const normalizedEmail = email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  const lockState = isLoginLocked(normalizedEmail);
  if (lockState.locked) {
    throw new AppError('พยายามเข้าสู่ระบบผิดพลาดหลายครั้ง กรุณารอแล้วลองใหม่', {
      status: 429,
      code: 'ACCOUNT_LOCKED',
      details: { retryAfterSeconds: lockState.retryAfterSeconds },
    });
  }

  if (!user) {
    const attempt = registerFailedLogin(normalizedEmail, {});
    throw new AppError('อีเมลหรือรหัสผ่านไม่ถูกต้อง', {
      status: 401,
      code: 'INVALID_CREDENTIALS',
      details: attempt.lockedUntil
        ? { retryAfterSeconds: Math.ceil((attempt.lockedUntil - Date.now()) / 1000) }
        : undefined,
    });
  }

  if (!user.verified) {
    throw new AppError('กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ', { status: 403, code: 'EMAIL_NOT_VERIFIED' });
  }

  const passwordOk = await verifyPassword(user.passwordHash, password);
  if (!passwordOk) {
    const attempt = registerFailedLogin(normalizedEmail, {});
    throw new AppError('อีเมลหรือรหัสผ่านไม่ถูกต้อง', {
      status: 401,
      code: 'INVALID_CREDENTIALS',
      details: attempt.lockedUntil
        ? { retryAfterSeconds: Math.ceil((attempt.lockedUntil - Date.now()) / 1000) }
        : undefined,
    });
  }

  resetLoginAttempts(normalizedEmail);

  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  await createRefreshSession(user.id, res);

  return {
    accessToken,
    user: sanitizeUser(user),
  };
}

export async function refreshSession({ req, res }) {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return { accessToken: null, user: null };
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch (error) {
    res.clearCookie('refreshToken');
    return { accessToken: null, user: null };
  }

  const tokenHash = hashToken(token);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    res.clearCookie('refreshToken');
    return { accessToken: null, user: null };
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    await prisma.refreshToken.update({ where: { tokenHash }, data: { revoked: true } });
    res.clearCookie('refreshToken');
    return { accessToken: null, user: null };
  }

  // SECURITY: rotate refresh tokens on every use to reduce replay risk.
  await prisma.refreshToken.update({ where: { tokenHash }, data: { revoked: true } });
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  await createRefreshSession(user.id, res);

  return {
    accessToken,
    user: sanitizeUser(user),
  };
}

export async function logoutUser({ req, res }) {
  const token = req.cookies?.refreshToken;
  if (token) {
    const tokenHash = hashToken(token);
    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });
  }
  res.clearCookie('refreshToken');
  return { ok: true };
}

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('ไม่พบบัญชี', { status: 404, code: 'USER_NOT_FOUND' });
  }
  return sanitizeUser(user);
}
