import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import Countdown from '../components/ui/Countdown.jsx';
import http from '../api/http.js';
import { useToast } from '../components/ui/Toast.jsx';
import { resendOtpSchema, verifyEmailSchema } from '../utils/validators.js';

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { notify } = useToast();
  const initialEmail = useMemo(() => {
    const stateEmail = location.state?.email;
    if (stateEmail) return stateEmail;
    const params = new URLSearchParams(location.search);
    return params.get('email') || '';
  }, [location]);

  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(() => (initialEmail ? 60 : 0));
  const [otpValues, setOtpValues] = useState(() => Array(6).fill(''));
  const otpInputsRef = useRef([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
        setValue,
  } = useForm({
    mode: 'onChange',
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email: initialEmail, code: '' },
  });

  useEffect(() => {
    if (initialEmail) {
      setValue('email', initialEmail);
    }
  }, [initialEmail, setValue]);

  useEffect(() => {
    const code = otpValues.join('');
    setValue('code', code, { shouldValidate: true, shouldDirty: true });
  }, [otpValues, setValue]);

  const focusInput = useCallback((index) => {
    const node = otpInputsRef.current[index];
    if (node) {
      node.focus();
      node.select?.();
    }
  }, []);

  const handleOtpChange = useCallback((index, raw) => {
    const value = raw.replace(/\D/g, '').slice(-1);
    setOtpValues((prev) => {
      const next = [...prev];
      next[index] = value || '';
      return next;
    });
    if (value && index < otpInputsRef.current.length - 1) {
      focusInput(index + 1);
    }
  }, [focusInput]);

  const handleOtpKeyDown = useCallback((index, event) => {
    if (event.key === 'Backspace' && !otpValues[index] && index > 0) {
      event.preventDefault();
      setOtpValues((prev) => {
        const next = [...prev];
        next[index - 1] = '';
        return next;
      });
      focusInput(index - 1);
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
    }
    if (event.key === 'ArrowRight' && index < otpInputsRef.current.length - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  }, [focusInput, otpValues]);

  const handleOtpPaste = useCallback((event) => {
    const text = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    event.preventDefault();
    const chars = text.split('');
    setOtpValues((prev) => {
      const next = [...prev];
      for (let i = 0; i < next.length; i += 1) {
        next[i] = chars[i] ?? '';
      }
      return next;
    });
    const targetIndex = Math.min(chars.length, otpInputsRef.current.length) - 1;
    if (targetIndex >= 0) {
      window.requestAnimationFrame(() => focusInput(targetIndex));
    }
  }, [focusInput]);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await http.post('/auth/verify-email', values);
      notify({ title: 'ยืนยันสำเร็จ', description: 'ระบบจะพาคุณไปยังหน้าล็อกอิน' });
      navigate('/login', { state: { email: values.email }, replace: true });
    } catch (error) {
      const message = error.response?.data?.error?.message || 'ยืนยันไม่สำเร็จ';
      notify({ title: 'เกิดข้อผิดพลาด', description: message, variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    const email = location.state?.email || initialEmail;
    const parsed = resendOtpSchema.safeParse({ email });
    if (!parsed.success) {
      notify({ title: 'กรุณากรอกอีเมลให้ถูกต้อง', variant: 'error' });
      return;
    }
    setResending(true);
    try {
      await http.post('/auth/resend-otp', { email });
      notify({ title: 'ส่งรหัสใหม่แล้ว', description: `กรุณาตรวจสอบ ${email}` });
      setCooldown(60);
    } catch (error) {
      const retryAfter = error.response?.data?.error?.details?.retryAfterSeconds;
      if (retryAfter) {
        setCooldown(retryAfter);
      }
      const message = error.response?.data?.error?.message || 'ส่งรหัสไม่สำเร็จ';
      notify({ title: 'เกิดข้อผิดพลาด', description: message, variant: 'error' });
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="ยืนยันอีเมลของคุณ"
      subtitle={`เราได้ส่งรหัส OTP 6 หลักไปยัง ${initialEmail || 'อีเมลของคุณ'}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="อีเมล"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">รหัส OTP</label>
          <div className="flex justify-between gap-2">
            {otpValues.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  otpInputsRef.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(event) => handleOtpChange(index, event.target.value)}
                onKeyDown={(event) => handleOtpKeyDown(index, event)}
                onFocus={(event) => event.target.select()}
                onPaste={index === 0 ? handleOtpPaste : undefined}
                className="h-14 w-14 rounded-xl bg-white/10 border border-white/20 text-center text-xl font-semibold text-slate-100 focus:border-sky-400/60 focus:bg-white/15 transition"
              />
            ))}
          </div>
          <input type="hidden" {...register('code')} />
          {errors.code?.message && (
            <p className="text-xs text-rose-300">{errors.code.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" loading={submitting}>
          ยืนยันอีเมล
        </Button>
        <div className="flex items-center justify-between text-sm text-slate-200/80">
          <span>ไม่ได้รับรหัส?</span>
          <div className="flex items-center gap-3">
            {cooldown > 0 && <Countdown seconds={cooldown} onCompleted={() => setCooldown(0)} />}
            <Button
              type="button"
              variant="ghost"
              className="px-3 py-1 text-xs"
              onClick={handleResend}
              loading={resending}
              disabled={cooldown > 0 || resending}
            >
              ส่งรหัสอีกครั้ง
            </Button>
          </div>
        </div>
        <p className="text-sm text-center text-slate-200/80">
          ย้อนกลับไปยัง{' '}
          <Link to="/login" className="text-sky-300 hover:underline">
            หน้าเข้าสู่ระบบ
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
