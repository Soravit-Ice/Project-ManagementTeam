import { useState, useEffect } from 'react';

export default function UserModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    gender: 'MALE',
    level: '',
    dailyRate: '',
    accountType: 'EMPLOYEE',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        gender: user.gender || 'MALE',
        level: user.level || '',
        dailyRate: user.dailyRate || '',
        accountType: user.accountType || 'EMPLOYEE',
        password: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSave(formData);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {user ? '✏️ แก้ไขผู้ใช้' : '👤 เพิ่มผู้ใช้ใหม่'}
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                {user ? 'อัพเดทข้อมูลผู้ใช้' : 'สร้างบัญชีผู้ใช้ใหม่'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                👤 ชื่อ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="ชื่อจริง"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-black placeholder:text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                👤 นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="นามสกุล"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-black placeholder:text-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              📧 อีเมล <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@company.com"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-black placeholder:text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              🔒 รหัสผ่าน {!user && <span className="text-red-500">*</span>}
              {user && <span className="text-black text-xs ml-2">(เว้นว่างหากไม่ต้องการเปลี่ยน)</span>}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!user}
              placeholder="••••••••"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-black placeholder:text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              📱 เบอร์โทรศัพท์
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="0812345678"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-black placeholder:text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              🏠 ที่อยู่
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              placeholder="ที่อยู่สำหรับติดต่อ..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none text-black placeholder:text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-3">
              ⚧ เพศ
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'MALE', label: 'ชาย', icon: '👨' },
                { value: 'FEMALE', label: 'หญิง', icon: '👩' },
                { value: 'OTHER', label: 'อื่นๆ', icon: '🧑' },
              ].map((gender) => (
                <label
                  key={gender.value}
                  className={`relative flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.gender === gender.value
                      ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={gender.value}
                    checked={formData.gender === gender.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="text-xl">{gender.icon}</span>
                  <span className="font-medium text-sm">{gender.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                📊 ระดับ
              </label>
              <input
                type="text"
                name="level"
                value={formData.level}
                onChange={handleChange}
                placeholder="เช่น Junior, Senior, Manager"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-black placeholder:text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                💰 ค่าจ้างต่อวัน (บาท)
              </label>
              <input
                type="number"
                name="dailyRate"
                value={formData.dailyRate}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="1000.00"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-black placeholder:text-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              🎭 ประเภทบัญชี
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'EMPLOYEE', label: 'Employee', icon: '👤', color: 'blue' },
                { value: 'ADMINISTRATOR', label: 'Administrator', icon: '👑', color: 'purple' },
              ].map((type) => (
                <label
                  key={type.value}
                  className={`relative flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.accountType === type.value
                      ? `border-${type.color}-500 bg-${type.color}-50 ring-2 ring-${type.color}-200`
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="accountType"
                    value={type.value}
                    checked={formData.accountType === type.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="text-xl">{type.icon}</span>
                  <span className="font-medium text-sm">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border-2 border-gray-300 text-black rounded-xl hover:bg-gray-100 font-medium transition-all"
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 font-medium shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>บันทึก</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
