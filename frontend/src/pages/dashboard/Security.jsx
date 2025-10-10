import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <Card className="p-8 text-slate-100 space-y-5">
        <div>
          <h2 className="text-2xl font-semibold text-glow">ความปลอดภัยบัญชี</h2>
          <p className="text-sm text-slate-200/80">ตรวจสอบและเพิ่มมาตรการความปลอดภัยเพื่อปกป้องบัญชีของคุณ</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
            <p className="text-sm font-semibold text-slate-100">การยืนยัน OTP</p>
            <p className="text-sm text-slate-200/80">เปิดใช้งานแล้ว • รหัสผ่านครั้งเดียวถูกบังคับใช้ในการยืนยันอีเมล</p>
            <Button variant="ghost" className="w-full" disabled>
              จัดการ OTP
            </Button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
            <p className="text-sm font-semibold text-slate-100">Two-Factor Authentication</p>
            <p className="text-sm text-slate-200/80">กำลังพัฒนา • เสริมความปลอดภัยอีกระดับด้วยแอป Authenticator</p>
            <Button className="w-full" disabled>
              เปิดใช้งานเร็ว ๆ นี้
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-8 text-slate-100 space-y-4">
        <h3 className="text-xl font-semibold">อุปกรณ์ที่ใช้งานล่าสุด</h3>
        <ul className="space-y-3 text-sm text-slate-200/80">
          <li className="flex items-center justify-between">
            <span>MacBook Pro • Safari</span>
            <span className="text-xs text-slate-300/70">วันนี้ 15:32</span>
          </li>
          <li className="flex items-center justify-between">
            <span>iPhone 15 • App</span>
            <span className="text-xs text-slate-300/70">เมื่อวาน 21:10</span>
          </li>
          <li className="flex items-center justify-between">
            <span>Windows • Edge</span>
            <span className="text-xs text-slate-300/70">2 วันที่แล้ว</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
