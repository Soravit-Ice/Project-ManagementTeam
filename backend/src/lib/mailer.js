import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

let transporter;

export function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: env.SMTP_USER
      ? {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      }
      : undefined,
    tls: {
    rejectUnauthorized: true // ตรวจสอบความถูกต้องของ Certificate
  },
    secure: env.SMTP_PORT === 465,
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  return transporter;
}

export async function sendMail({ to, subject, html, text }) {
  const tx = getTransporter();
  try {
    const result = await tx.sendMail({
      from: env.MAIL_FROM,
      to,
      subject,
      html,
      text,
    });
    return result;
  } catch (error) {
    console.error(`[Mailer] Error sending email to ${to}:`, error.message || error);
    throw new AppError('ระบบไม่สามารถส่งอีเมลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง (Connection timeout/Error)', {
      status: 503,
      code: 'EMAIL_SEND_FAILED'
    });
  }
}
