import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import adminApi from '../../api/admin';
import useAuthStore from '../../store/auth.js';

export default function AdminHome() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError('');
        const { data } = await adminApi.getDashboardStats();
        setStats(data.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        const message = error.response?.status === 403
          ? 'บัญชีนี้ไม่มีสิทธิ์เข้าถึงหน้าแอดมิน'
          : 'ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-6">กำลังโหลด...</div>;
  }

  if (user && user.accountType !== 'ADMINISTRATOR') {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg">
          ⛔ ไม่มีสิทธิ์เข้าถึงหน้าแอดมิน
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => {
              setLoading(true);
              setError('');
              (async () => {
                try {
                  const { data } = await adminApi.getDashboardStats();
                  setStats(data.data);
                } catch (err) {
                  console.error(err);
                  setError('ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่');
                } finally {
                  setLoading(false);
                }
              })();
            }}
            className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            ลองอีกครั้ง
          </button>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-4xl">📊</span>
            <span>Dashboard</span>
          </h1>
          <p className="text-gray-600 mt-1">ภาพรวมระบบจัดการโปรเจกต์</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('th-TH', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-blue-100 text-sm font-medium">จำนวนผู้ใช้ทั้งหมด</h3>
              <p className="text-4xl font-bold mt-2">{stats?.stats?.userCount || 0}</p>
              <p className="text-blue-100 text-xs mt-1">Active Users</p>
            </div>
            <div className="text-6xl opacity-20">👥</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-purple-100 text-sm font-medium">จำนวนโปรเจกต์ทั้งหมด</h3>
              <p className="text-4xl font-bold mt-2">{stats?.stats?.projectCount || 0}</p>
              <p className="text-purple-100 text-xs mt-1">Total Projects</p>
            </div>
            <div className="text-6xl opacity-20">📁</div>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-purple-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">📁</span>
            <span>โปรเจกต์ล่าสุด</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">5 โปรเจกต์ที่สร้างล่าสุด</p>
        </div>
        <div className="p-6">
          {stats?.recentProjects?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentProjects.map((project, index) => (
                <div 
                  key={project.id} 
                  className="flex justify-between items-center p-4 border-2 border-gray-100 rounded-xl hover:border-purple-200 hover:bg-purple-50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
                        {project.name}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <span>👤</span>
                        <span>{project.creator?.name || project.user?.name}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <span>📅</span>
                      <span>{new Date(project.createdAt).toLocaleDateString('th-TH')}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-3">📁</div>
              <p className="text-gray-500 font-medium">ยังไม่มีโปรเจกต์</p>
              <p className="text-sm text-gray-400 mt-1">เริ่มสร้างโปรเจกต์แรกของคุณ</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b border-blue-100">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">👥</span>
                <span>ผู้ใช้ล่าสุด</span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">5 ผู้ใช้ที่เพิ่มล่าสุด</p>
            </div>
            <Link 
              to="/admin/users" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
            >
              <span>ดูทั้งหมด</span>
              <span>→</span>
            </Link>
          </div>
        </div>
        <div className="p-6">
          {stats?.recentUsers?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="flex justify-between items-center p-4 border-2 border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {user.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <span>📧</span>
                        <span>{user.email}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      user.accountType === 'ADMINISTRATOR' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.accountType === 'ADMINISTRATOR' ? '👑 Admin' : '👤 Employee'}
                    </span>
                    <p className="text-xs text-gray-400 mt-2 flex items-center justify-end gap-1">
                      <span>📅</span>
                      <span>{new Date(user.createdAt).toLocaleDateString('th-TH')}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-3">👥</div>
              <p className="text-gray-500 font-medium">ยังไม่มีผู้ใช้</p>
              <p className="text-sm text-gray-400 mt-1">เพิ่มผู้ใช้เพื่อเริ่มต้นใช้งาน</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
