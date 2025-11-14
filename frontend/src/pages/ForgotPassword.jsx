import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import http from '../api/http.js';
import { useToast } from '../components/ui/Toast.jsx';
import { forgotPasswordSchema } from '../utils/validators.js';

export default function ForgotPasswordPage() {
  const { notify } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await http.post('/auth/forgot-password', values);
      setSent(true);
      notify({ title: 'ส่งลิงก์แล้ว', description: 'กรุณาตรวจสอบอีเมลของคุณ' });
    } catch (error) {
      const message = error.response?.data?.error?.message || 'ไม่สามารถส่งลิงก์ได้';
      notify({ title: 'เกิดข้อผิดพลาด', description: message, variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="ลืมรหัสผ่าน" subtitle={sent ? 'เราได้ส่งลิงก์รีเซ็ตไปยังอีเมล (ถ้ามีอยู่ในระบบ)' : 'ระบุอีเมลของคุณเพื่อรับลิงก์รีเซ็ต'}>
      {sent ? (
        <div className="space-y-6">
          <p className="text-sm text-slate-200/90">
            หากไม่พบอีเมล โปรดตรวจสอบโฟลเดอร์สแปม หรือส่งคำขอใหม่อีกครั้งภายหลัง
          </p>
          <div className="flex items-center justify-between text-sm text-slate-200/80">
            <Link to="/login" className="text-sky-300 hover:underline">
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="อีเมล"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" className="w-full" loading={submitting}>
            ส่งลิงก์รีเซ็ต
          </Button>
          <p className="text-sm text-center text-slate-200/80">
            จำรหัสผ่านได้แล้ว?{' '}
            <Link to="/login" className="text-sky-300 hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}

