const otpCooldown = new Map();
const loginAttempts = new Map();

export function checkOtpCooldown(identifier, cooldownSeconds) {
  const data = otpCooldown.get(identifier);
  if (!data) return { allowed: true };
  const now = Date.now();
  const diffMs = now - data.timestamp;
  const cooldownMs = cooldownSeconds * 1000;
  if (diffMs < cooldownMs) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((cooldownMs - diffMs) / 1000),
    };
  }
  return { allowed: true };
}

export function markOtpSent(identifier) {
  otpCooldown.set(identifier, { timestamp: Date.now() });
}

export function registerFailedLogin(identifier, { lockoutThreshold = 5, lockoutMs = 5 * 60 * 1000 } = {}) {
  const entry = loginAttempts.get(identifier) || { count: 0, lockedUntil: null };
  const now = Date.now();
  if (entry.lockedUntil && entry.lockedUntil > now) {
    return entry;
  }
  const count = entry.count + 1;
  if (count >= lockoutThreshold) {
    const lockedUntil = now + lockoutMs;
    const updated = { count, lockedUntil };
    loginAttempts.set(identifier, updated);
    return updated;
  }
  const updated = { count, lockedUntil: null };
  loginAttempts.set(identifier, updated);
  return updated;
}

export function resetLoginAttempts(identifier) {
  loginAttempts.delete(identifier);
}

export function isLoginLocked(identifier) {
  const entry = loginAttempts.get(identifier);
  if (!entry) return { locked: false };
  const now = Date.now();
  if (entry.lockedUntil && entry.lockedUntil > now) {
    return {
      locked: true,
      retryAfterSeconds: Math.ceil((entry.lockedUntil - now) / 1000),
    };
  }
  if (entry.lockedUntil && entry.lockedUntil <= now) {
    loginAttempts.delete(identifier);
  }
  return { locked: false };
}
