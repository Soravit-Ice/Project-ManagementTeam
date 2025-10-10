import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import useAuthStore from '../../store/auth.js';

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <Card className="p-8 text-slate-100 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-glow">ตั้งค่าบัญชี</h2>
          <p className="text-sm text-slate-200/80">
            ปรับปรุงข้อมูลส่วนตัวของคุณเพื่อให้การแจ้งเตือนและความปลอดภัยทำงานได้เต็มที่
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Input label="ชื่อ" defaultValue={user?.name} readOnly helper="ฟีเจอร์แก้ไขกำลังจะมาเร็ว ๆ นี้" />
          <Input label="อีเมล" defaultValue={user?.email} readOnly />
        </div>
        <Button className="w-full md:w-auto" disabled>
          บันทึกการเปลี่ยนแปลง
        </Button>
      </Card>

      <Card className="p-8 text-slate-100 space-y-4">
        <h3 className="text-xl font-semibold">การแจ้งเตือน</h3>
        <p className="text-sm text-slate-200/80">จัดการการแจ้งเตือนผ่านอีเมลและอุปกรณ์ต่าง ๆ</p>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
          <p className="text-sm text-slate-200/80">คุณจะได้รับการแจ้งเตือนสำหรับเหตุการณ์สำคัญ เช่น การเข้าสู่ระบบใหม่และการยืนยันความปลอดภัย</p>
        </div>
      </Card>
    </div>
  );
}
