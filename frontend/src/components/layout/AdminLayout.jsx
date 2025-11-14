import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/auth';
import http from '../../api/http';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearSession } = useAuthStore();

  const handleLogout = async () => {
    try {
      await http.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearSession();
      navigate('/login');
    }
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '🏠' },
    { path: '/admin/users', label: 'จัดการผู้ใช้', icon: '👥' },
    { path: '/admin/projects', label: 'จัดการโปรเจกต์', icon: '📁' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">{user?.name}</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64">
        <Outlet />
      </main>
    </div>
  );
}
