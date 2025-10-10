import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import http from '../api/http.js';
import { useToast } from '../components/ui/Toast.jsx';
import { loginSchema } from '../utils/validators.js';
import useAuthStore from '../store/auth.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useToast();
  const setSession = useAuthStore((state) => state.setSession);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    resolver: zodResolver(loginSchema),
    defaultValues: { email: location.state?.email || '', password: '' },
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const { data } = await http.post('/auth/login', values);
      const { accessToken, user } = data.data;
      setSession({ accessToken, user });
      notify({ title: 'ยินดีต้อนรับกลับ', description: `สวัสดีคุณ ${user.name}` });
      const redirect = location.state?.redirectTo || '/dashboard';
      navigate(redirect, { replace: true });
    } catch (error) {
      const resp = error.response?.data?.error;
      const message = resp?.message || 'เข้าสู่ระบบไม่สำเร็จ';
      notify({ title: 'เกิดข้อผิดพลาด', description: message, variant: 'error' });
      if (resp?.code === 'EMAIL_NOT_VERIFIED') {
        navigate('/verify-email', { state: { email: values.email } });
      }
      if (resp?.code === 'INVALID_CREDENTIALS' && resp?.details?.retryAfterSeconds) {
        notify({
          title: 'บัญชีถูกล็อกชั่วคราว',
          description: `กรุณารอ ${resp.details.retryAfterSeconds} วินาทีแล้วลองใหม่`,
          variant: 'error',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="เข้าสู่ระบบ" subtitle="ตรวจสอบอีเมลของคุณก่อนล็อกอินเพื่อความปลอดภัย">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="อีเมล"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="space-y-2">
          <div className="relative">
            <Input
              label="รหัสผ่าน"
              type={showPassword ? 'text' : 'password'}
              placeholder="********"
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              className="absolute right-4 top-10 text-xs text-sky-200"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? 'ซ่อน' : 'แสดง'}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full" loading={submitting}>
          เข้าสู่ระบบ
        </Button>
        <p className="text-sm text-center text-slate-200/80">
          ยังไม่มีบัญชี?{' '}
          <Link to="/register" className="text-sky-300 hover:underline">
            สมัครใช้งาน
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
