import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: `${env.ACCESS_TOKEN_TTL_MINUTES}m`,
  });
}

export function signRefreshToken(payload, { expiresIn, jwtid } = {}) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: expiresIn || `${env.REFRESH_TOKEN_TTL_DAYS}d`,
    jwtid,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

export function decodeToken(token) {
  return jwt.decode(token);
}
