import { useState } from 'react';
import * as XLSX from 'xlsx';
import adminApi from '../../api/admin';

export default function ExcelUploadModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');
    setResult(null);

    // Preview file
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        setPreview(data.slice(0, 5)); // Show first 5 rows
      } catch (err) {
        setError('ไม่สามารถอ่านไฟล์ได้');
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await adminApi.downloadProjectTemplate();

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'project-template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('ไม่สามารถดาวน์โหลด template ได้');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('กรุณาเลือกไฟล์');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const response = await adminApi.uploadProjects(file);
      setResult(response.data.data);

      if (response.data.data.successCount > 0) {
        setTimeout(() => {
          onSuccess();
          if (response.data.data.errorCount === 0) {
            onClose();
          }
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'เกิดข้อผิดพลาดในการอัพโหลด');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>📤</span>
                <span>Import โปรเจกต์จาก Excel</span>
              </h2>
              <p className="text-green-100 text-sm mt-1">อัพโหลดไฟล์ Excel เพื่อเพิ่มโปรเจกต์หลายรายการพร้อมกัน</p>
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

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {result && (
            <div className={`p-4 rounded-lg border-l-4 ${
              result.errorCount === 0 ? 'bg-green-50 border-green-500 text-green-700' : 'bg-yellow-50 border-yellow-500 text-yellow-700'
            }`}>
              <p className="font-semibold mb-2">ผลการอัพโหลด:</p>
              <ul className="text-sm space-y-1">
                <li>✅ สำเร็จ: {result.successCount} รายการ</li>
                {result.errorCount > 0 && <li>❌ ผิดพลาด: {result.errorCount} รายการ</li>}
              </ul>
              {result.results.errors.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer font-medium">ดูรายละเอียด errors</summary>
                  <ul className="mt-2 text-xs space-y-1 ml-4">
                    {result.results.errors.map((err, idx) => (
                      <li key={idx}>แถว {err.row}: {err.error}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          {/* Download Template */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="text-3xl">📥</div>
              <div className="flex-1">
                <h3 className="font-semibold text-black mb-1">ดาวน์โหลด Template</h3>
                <p className="text-sm text-black mb-3">
                  ดาวน์โหลดไฟล์ตัวอย่างพร้อมคำแนะนำการกรอกข้อมูล
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  📥 ดาวน์โหลด Template
                </button>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              📎 เลือกไฟล์ Excel
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-black file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
            />
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h3 className="font-semibold text-black mb-3">
                ตัวอย่างข้อมูล ({preview.length} แถวแรก)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left border">Project Name</th>
                      <th className="px-3 py-2 text-left border">Description</th>
                      <th className="px-3 py-2 text-left border">Start Date</th>
                      <th className="px-3 py-2 text-left border">End Date</th>
                      <th className="px-3 py-2 text-left border">Cost</th>
                      <th className="px-3 py-2 text-left border">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-3 py-2 border">{row['Project Name']}</td>
                        <td className="px-3 py-2 border truncate max-w-xs">{row['Description']}</td>
                        <td className="px-3 py-2 border">{row['Start Date']}</td>
                        <td className="px-3 py-2 border">{row['End Date']}</td>
                        <td className="px-3 py-2 border">{row['Internal Cost']}</td>
                        <td className="px-3 py-2 border">{row['Status']}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-gray-300 text-black rounded-xl hover:bg-gray-100 font-medium transition-all"
            disabled={uploading}
          >
            ยกเลิก
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 font-medium shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {uploading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>กำลังอัพโหลด...</span>
              </>
            ) : (
              <>
                <span>📤</span>
                <span>อัพโหลด</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
