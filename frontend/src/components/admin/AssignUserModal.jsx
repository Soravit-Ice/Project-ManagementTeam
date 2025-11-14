import { useState, useEffect } from 'react';
import adminApi from '../../api/admin';

export default function AssignUserModal({ project, onClose, onAssign }) {
  const [users, setUsers] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [workDays, setWorkDays] = useState(1);

  useEffect(() => {
    fetchData();
  }, [project]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, assignmentsRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getProjectAssignments(project.id),
      ]);
      setUsers(usersRes.data.data);
      setAssignedUsers(assignmentsRes.data.data.assignments || assignmentsRes.data.data);
      setBudget(assignmentsRes.data.data.budget || null);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setWorkDays(1);
    setError('');
  };

  const handleConfirmAssign = async () => {
    if (!selectedUser || !workDays || workDays < 1) {
      setError('กรุณาระบุจำนวนวันทำงาน');
      return;
    }

    try {
      await onAssign(selectedUser.id, workDays);
      setSelectedUser(null);
      setWorkDays(1);
      await fetchData(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.error?.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleUnassign = async (userId) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะยกเลิกการ assign?')) return;

    try {
      await adminApi.unassignUserFromProject(project.id, userId);
      await fetchData(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.error?.message || 'เกิดข้อผิดพลาด');
    }
  };

  const assignedUserIds = new Set(assignedUsers.map((a) => a.userId));
  
  // Helper function to get daily rate from user
  const getDailyRate = (user) => {
    // ถ้ามี dailyRate ใช้เลย
    if (user.dailyRate && user.dailyRate > 0) {
      return user.dailyRate;
    }
    // ถ้าไม่มี ลองดูจาก level (ถ้าเป็นตัวเลข)
    if (user.level) {
      const levelAsNumber = parseFloat(user.level);
      if (!isNaN(levelAsNumber) && levelAsNumber > 0) {
        return levelAsNumber;
      }
    }
    return 0;
  };

  const availableUsers = users
    .map((u) => ({
      ...u,
      effectiveDailyRate: getDailyRate(u),
    }))
    .filter((u) => !assignedUserIds.has(u.id) && u.effectiveDailyRate > 0);

  const calculateCost = (user, days) => {
    return (user.effectiveDailyRate || getDailyRate(user) || 0) * days;
  };

  const remainingBudget = budget?.remaining || 0;
  const isBudgetExhausted = remainingBudget <= 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>👥</span>
                <span>Assign Users</span>
              </h2>
              <p className="text-indigo-100 text-sm mt-1 truncate max-w-md">
                {project.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <svg className="animate-spin h-12 w-12 mx-auto text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="mt-4 text-black">กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Budget Info */}
              {budget && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-black flex items-center gap-2">
                      <span>💰</span>
                      <span>งบประมาณโปรเจกต์</span>
                    </h4>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-black">งบทั้งหมด</p>
                      <p className="text-lg font-bold text-black">
                        {budget.total.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-black">ใช้ไปแล้ว</p>
                      <p className="text-lg font-bold text-orange-600">
                        {budget.spent.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-black">คงเหลือ</p>
                      <p className={`text-lg font-bold ${remainingBudget > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {budget.remaining.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          budget.percentage >= 100 ? 'bg-red-500' : budget.percentage >= 80 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-black mt-1 text-center">
                      ใช้ไป {budget.percentage.toFixed(1)}%
                    </p>
                  </div>
                  {isBudgetExhausted && (
                    <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded-lg text-center">
                      <p className="text-sm text-red-700 font-medium">⚠️ งบประมาณหมดแล้ว</p>
                    </div>
                  )}
                </div>
              )}

              {/* Assigned Users */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-black flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full text-sm font-bold">
                      {assignedUsers.length}
                    </span>
                    <span>ผู้ใช้ที่ถูก Assign</span>
                  </h3>
                </div>
                {assignedUsers.length > 0 ? (
                  <div className="space-y-2">
                    {assignedUsers.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex justify-between items-center p-4 border-2 border-green-200 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                            {assignment.user.name?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-black">{assignment.user.name}</p>
                            <p className="text-sm text-black">{assignment.user.email}</p>
                            <div className="flex gap-3 mt-1 text-xs text-black">
                              <span>💰 {assignment.dailyRate?.toLocaleString()} บาท/วัน</span>
                              <span>📅 {assignment.workDays} วัน</span>
                              <span className="font-semibold text-green-700">
                                รวม: {assignment.totalCost?.toLocaleString()} บาท
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnassign(assignment.userId)}
                          className="px-4 py-2 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border-2 border-red-200 hover:border-red-600 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          🗑️ ลบ
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="text-4xl mb-2">👤</div>
                    <p className="text-black">ยังไม่มีผู้ใช้ที่ถูก assign</p>
                  </div>
                )}
              </div>

              {/* Available Users */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-black flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                      {availableUsers.length}
                    </span>
                    <span>ผู้ใช้ที่สามารถ Assign ได้</span>
                  </h3>
                </div>
                {availableUsers.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {availableUsers.map((user) => {
                      const isSelected = selectedUser?.id === user.id;
                      const estimatedCost = calculateCost(user, workDays);
                      const canAfford = estimatedCost <= remainingBudget;

                      return (
                        <div
                          key={user.id}
                          className={`border-2 rounded-xl transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex justify-between items-center p-4">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                                {user.name?.charAt(0) || '?'}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-black">{user.name}</p>
                                <p className="text-sm text-black">{user.email}</p>
                                <p className="text-xs text-black mt-1">
                                  💰 {user.effectiveDailyRate?.toLocaleString()} บาท/วัน
                                  {!user.dailyRate && user.level && (
                                    <span className="text-orange-600 ml-1">(จาก level)</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleSelectUser(user)}
                              disabled={isBudgetExhausted}
                              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSelected ? '✓ เลือกแล้ว' : '➕ เลือก'}
                            </button>
                          </div>

                          {isSelected && (
                            <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                              <div className="bg-white p-3 rounded-lg border border-blue-200">
                                <label className="block text-sm font-semibold text-black mb-2">
                                  📅 จำนวนวันทำงาน
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={workDays}
                                  onChange={(e) => setWorkDays(parseInt(e.target.value) || 1)}
                                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="mt-2 p-2 bg-gray-50 rounded">
                                  <p className="text-sm text-black">
                                    ค่าใช้จ่ายโดยประมาณ:{' '}
                                    <span className={`font-bold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                                      {estimatedCost.toLocaleString()} บาท
                                    </span>
                                  </p>
                                  {!canAfford && (
                                    <p className="text-xs text-red-600 mt-1">
                                      ⚠️ เกินงบประมาณที่เหลือ ({remainingBudget.toLocaleString()} บาท)
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setSelectedUser(null)}
                                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-black rounded-lg hover:bg-gray-100 font-medium transition-all"
                                >
                                  ยกเลิก
                                </button>
                                <button
                                  onClick={handleConfirmAssign}
                                  disabled={!canAfford}
                                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium shadow-lg shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  ✓ ยืนยัน Assign
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="text-4xl mb-2">
                      {users.length === 0 ? '👤' : assignedUsers.length === users.length ? '✅' : '💰'}
                    </div>
                    <p className="text-black font-medium">
                      {users.length === 0
                        ? 'ยังไม่มีผู้ใช้ในระบบ'
                        : assignedUsers.length === users.length
                        ? 'ผู้ใช้ทั้งหมดถูก assign แล้ว'
                        : 'ไม่มีผู้ใช้ที่มีค่าจ้างต่อวัน'}
                    </p>
                    <p className="text-sm text-black mt-1">
                      {users.length === 0
                        ? 'สร้างผู้ใช้ใหม่ก่อน'
                        : assignedUsers.length === users.length
                        ? 'ทุกคนได้รับมอบหมายแล้ว'
                        : 'กรุณาตั้งค่าจ้างต่อวันให้ผู้ใช้ก่อน'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-gray-50 px-6 py-4 flex justify-end border-t">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 font-medium shadow-lg shadow-indigo-500/30 transition-all"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
