import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import http from '../api/http.js';
import { useToast } from '../components/ui/Toast.jsx';
import { resetPasswordSchema } from '../utils/validators.js';

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { notify } = useToast();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const defaultEmail = params.get('email') || '';
  const token = params.get('token') || '';
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: defaultEmail, token, password: '', confirmPassword: '' },
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await http.post('/auth/reset-password', {
        email: values.email,
        token: values.token,
        password: values.password,
      });
      notify({ title: 'รีเซ็ตรหัสผ่านสำเร็จ', description: 'โปรดเข้าสู่ระบบด้วยรหัสผ่านใหม่' });
      navigate('/login', { state: { email: values.email }, replace: true });
    } catch (error) {
      const message = error.response?.data?.error?.message || 'ไม่สามารถรีเซ็ตรหัสผ่านได้';
      notify({ title: 'เกิดข้อผิดพลาด', description: message, variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="ตั้งรหัสผ่านใหม่" subtitle="กรอกรหัสผ่านใหม่สำหรับบัญชีของคุณ">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="อีเมล"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="รหัสผ่านใหม่"
          type="password"
          placeholder="********"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="ยืนยันรหัสผ่านใหม่"
          type="password"
          placeholder="********"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <input type="hidden" {...register('token')} />
        <Button type="submit" className="w-full" loading={submitting}>
          บันทึกรหัสผ่านใหม่
        </Button>
        <p className="text-sm text-center text-slate-200/80">
          กลับไปหน้า{' '}
          <Link to="/login" className="text-sky-300 hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

