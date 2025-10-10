import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import useAuthStore from '../../store/auth.js';

export default function OverviewPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-8 text-slate-100 space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300/70">ภาพรวม</p>
          <h1 className="text-3xl font-semibold text-glow">ยินดีต้อนรับกลับ {user?.name}</h1>
          <p className="text-slate-200/80 leading-relaxed">
            บัญชีของคุณได้รับการยืนยันแล้ว สามารถใช้งานระบบได้เต็มรูปแบบ เราแนะนำให้ตั้งค่า 2FA และสำรองข้อมูลการเข้าสู่ระบบเพื่อความปลอดภัยสูงสุด
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="ghost" className="px-5 py-2.5">
              อัปเดตโปรไฟล์
            </Button>
            <Button className="px-5 py-2.5">
              ตั้งค่า 2FA
            </Button>
          </div>
        </Card>
        <Card className="p-8 text-slate-100 space-y-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300/70">กิจกรรมล่าสุด</p>
          <ul className="space-y-3 text-sm text-slate-200/80">
            <li className="flex items-center justify-between">
              <span>เข้าสู่ระบบจาก Chrome</span>
              <span className="text-xs text-slate-300/70">เมื่อสักครู่</span>
            </li>
            <li className="flex items-center justify-between">
              <span>ยืนยันอีเมลเรียบร้อย</span>
              <span className="text-xs text-slate-300/70">5 นาทีที่แล้ว</span>
            </li>
            <li className="flex items-center justify-between">
              <span>เพิ่มการยืนยันแบบ OTP</span>
              <span className="text-xs text-slate-300/70">30 นาทีที่แล้ว</span>
            </li>
          </ul>
        </Card>
      </div>

      <Card className="p-8 text-slate-100 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-300/80">สถานะการยืนยัน</p>
            <h2 className="mt-1 text-2xl font-semibold text-sky-200">บัญชีปลอดภัย</h2>
          </div>
          <div className="rounded-2xl bg-sky-500/20 px-4 py-2 text-sm text-sky-100">การป้องกัน 2 ชั้นพร้อมใช้งาน</div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300/70">อีเมล</p>
            <p className="mt-2 text-lg font-semibold">{user?.email}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300/70">สถานะ</p>
            <p className="mt-2 inline-flex items-center gap-2 text-emerald-300 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-300" /> Verified
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300/70">เข้าร่วมเมื่อ</p>
            <p className="mt-2 text-lg font-semibold">วันนี้</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
