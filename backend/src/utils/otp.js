import crypto from 'crypto';
import argon2 from 'argon2';
import { env } from '../config/env.js';

export function generateOtp(length = 6) {
  const digits = [];
  for (let i = 0; i < length; i += 1) {
    digits.push(Math.floor(crypto.randomInt(0, 10)).toString());
  }
  return digits.join('');
}

export async function hashOtp(code) {
  return argon2.hash(code, {
    type: argon2.argon2id,
    memoryCost: 48 * 1024,
  });
}

export async function verifyOtp(hash, code) {
  try {
    return await argon2.verify(hash, code);
  } catch (error) {
    return false;
  }
}

export function buildOtpExpiry() {
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + env.OTP_TTL_MINUTES);
  return expires;
}
