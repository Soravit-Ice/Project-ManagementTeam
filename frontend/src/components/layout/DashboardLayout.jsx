import { NavLink, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/auth.js';
import Button from '../ui/Button.jsx';
import http from '../../api/http.js';
import { useToast } from '../ui/Toast.jsx';

const navItems = [
  { label: 'ภาพรวม', to: '/dashboard' },
  { label: 'ตั้งค่าบัญชี', to: '/dashboard/settings' },
  { label: 'ความปลอดภัย', to: '/dashboard/security' },
];

export default function DashboardLayout() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const { notify } = useToast();

  const handleLogout = async () => {
    try {
      await http.post('/auth/logout');
    } catch (error) {
      console.warn('logout failed', error);
    } finally {
      clearSession();
      notify({ title: 'ออกจากระบบแล้ว' });
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl gap-8 px-6 py-10">
        <aside className="glass-card w-72 rounded-3xl p-8 backdrop-blur-xl">
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-sky-200/70">บัญชีผู้ใช้</p>
              <h2 className="mt-3 text-2xl font-semibold text-glow">{user?.name}</h2>
              <p className="text-sm text-slate-300/80">{user?.email}</p>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `block rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'glass-card bg-white/10 text-sky-200 border border-white/20'
                        : 'text-slate-200/80 hover:bg-white/10'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-200/80">
              <p className="font-semibold text-slate-100">สถานะบัญชี</p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-300" /> ยืนยันแล้ว
              </div>
            </div>

            <Button variant="danger" className="w-full" onClick={handleLogout}>
              ออกจากระบบ
            </Button>
          </div>
        </aside>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
