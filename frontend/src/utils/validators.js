import { z } from 'zod';

export const passwordPolicy = z
  .string()
  .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
  .regex(/[A-Z]/, 'ต้องมีตัวอักษรภาษาอังกฤษพิมพ์ใหญ่')
  .regex(/[a-z]/, 'ต้องมีตัวอักษรภาษาอังกฤษพิมพ์เล็ก')
  .regex(/[0-9]/, 'ต้องมีตัวเลขอย่างน้อย 1 ตัว')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว');

export const registerSchema = z.object({
  name: z.string().min(2, 'ชื่อยาวอย่างน้อย 2 ตัวอักษร'),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: passwordPolicy,
});

export const loginSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});

export const verifyEmailSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  code: z
    .string()
    .min(6, 'OTP 6 หลัก')
    .max(6, 'OTP 6 หลัก')
    .regex(/^[0-9]{6}$/, 'ต้องเป็นตัวเลข 6 หลัก'),
});

export const resendOtpSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email('อีเมลไม่ถูกต้อง'),
    token: z.string().min(10, 'ลิงก์ไม่ถูกต้อง'),
    password: passwordPolicy,
    confirmPassword: z.string().min(1, 'กรุณายืนยันรหัสผ่าน'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'รหัสผ่านยืนยันไม่ตรงกัน',
    path: ['confirmPassword'],
  });
