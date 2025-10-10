import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import http from '../api/http.js';
import { useToast } from '../components/ui/Toast.jsx';
import { registerSchema } from '../utils/validators.js';

const passwordRequirements = [
  { label: 'ตัวอักษรพิมพ์ใหญ่', regex: /[A-Z]/ },
  { label: 'ตัวอักษรพิมพ์เล็ก', regex: /[a-z]/ },
  { label: 'ตัวเลข', regex: /[0-9]/ },
  { label: 'อักขระพิเศษ', regex: /[!@#$%^&*(),.?":{}|<>]/ },
];

function computeStrength(password) {
  if (!password) return { score: 0, label: 'เริ่มพิมพ์รหัสผ่าน', requirements: [] };
  const matches = passwordRequirements.map((req) => ({
    ...req,
    met: req.regex.test(password),
  }));
  const lengthBonus = password.length >= 12 ? 1 : 0;
  const score = matches.filter((m) => m.met).length + lengthBonus;
  const labels = ['อ่อนมาก', 'อ่อน', 'พอใช้', 'ดี', 'แข็งแรง'];
  const label = labels[Math.min(labels.length - 1, score)];

  return { score, label, requirements: matches };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    mode: 'onChange',
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const passwordValue = watch('password');
  const strength = useMemo(() => computeStrength(passwordValue), [passwordValue]);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await http.post('/auth/register', values);
      notify({
        title: 'สมัครสมาชิกสำเร็จ',
        description: 'กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีของคุณ',
      });
      navigate('/verify-email', { state: { email: values.email } });
    } catch (error) {
      const message = error.response?.data?.error?.message || 'สมัครสมาชิกไม่สำเร็จ';
      notify({ title: 'เกิดข้อผิดพลาด', description: message, variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="สร้างบัญชีใหม่"
      subtitle="ระบบรักษาความปลอดภัยระดับโปรดักชัน พร้อมยืนยันอีเมลแบบ OTP"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-5">
          <Input
            label="ชื่อ-นามสกุล"
            placeholder="สมชาย ใจดี"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="อีเมล"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <div className="space-y-3">
            <Input
              label="รหัสผ่าน"
              type="password"
              placeholder="********"
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="space-y-2 text-xs text-slate-200/70">
              <div className="flex items-center justify-between">
                <span>ความปลอดภัย</span>
                <span className="font-medium text-sky-300">{strength.label}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400"
                  style={{ width: `${(Math.min(strength.score, 4) / 4) * 100}%` }}
                />
              </div>
              <ul className="grid gap-1 text-left">
                {strength.requirements.map((req) => (
                  <li key={req.label} className={req.met ? 'text-emerald-300' : 'text-slate-400'}>
                    {req.met ? '✓' : '•'} {req.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Button type="submit" loading={submitting} className="w-full">
          สมัครสมาชิก
        </Button>
        <p className="text-sm text-center text-slate-200/80">
          มีบัญชีแล้ว?{' '}
          <Link to="/login" className="text-sky-300 hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
