import { useEffect, useState } from 'react';
import userApi from '../../api/user';

export default function MyProjects() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    try {
      const response = await userApi.getMyProjects();
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      LOCKED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      EXPIRED: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    const labels = {
      ACTIVE: 'กำลังดำเนินการ',
      LOCKED: 'ล็อค',
      EXPIRED: 'เสร็จสิ้น',
    };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  const { assignments = [], summary = {} } = data || {};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-4xl">📁</span>
              <span>โปรเจกต์ของฉัน</span>
            </h1>
            <p className="text-gray-600 mt-1">รายการโปรเจกต์ที่คุณได้รับมอบหมาย</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                try {
                  setExporting(true);
                  const { data: blob } = await userApi.exportMyProjectsExcel();
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `my-projects-${new Date()
                    .toISOString()
                    .slice(0, 16)
                    .replace(/[:T]/g, '-')}.xlsx`;
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  console.error('Export Excel failed', err);
                  alert('ไม่สามารถส่งออก Excel ได้');
                } finally {
                  setExporting(false);
                }
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
              disabled={exporting}
              title="ส่งออก Excel"
            >
              {exporting ? 'กำลังส่งออก...' : 'Export Excel'}
            </button>
            <button
              onClick={() => {
                // Open printable report in a new window and trigger print (Save as PDF)
                const w = window.open('', '_blank');
                if (!w) return;
                const style = `
                  <style>
                    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial; padding: 24px; color: #0f172a; }
                    h1 { margin: 0 0 8px; }
                    .muted { color: #475569; margin-bottom: 16px; }
                    table { width: 100%; border-collapse: collapse; font-size: 12px; }
                    th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
                    th { background: #f1f5f9; }
                    .summary { display: flex; gap: 16px; margin: 16px 0; }
                    .card { border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 8px; }
                  </style>
                `;
                const rows = (data?.assignments || []).map((a) => `
                  <tr>
                    <td>${a.project.name || ''}</td>
                    <td>${a.project.status || ''}</td>
                    <td>${a.workDays}</td>
                    <td>${a.dailyRate?.toLocaleString?.() || a.dailyRate}</td>
                    <td>${a.totalCost?.toLocaleString?.() || a.totalCost}</td>
                    <td>${new Date(a.assignedAt).toLocaleDateString('th-TH')}</td>
                    <td>${a.project.startDate ? new Date(a.project.startDate).toLocaleDateString('th-TH') : ''}</td>
                    <td>${a.project.endDate ? new Date(a.project.endDate).toLocaleDateString('th-TH') : ''}</td>
                  </tr>
                `).join('');
                const html = `
                  <html>
                    <head>
                      <title>my-projects-report</title>
                      ${style}
                    </head>
                    <body>
                      <h1>รายงานโปรเจกต์ของฉัน</h1>
                      <div class="muted">วันที่สร้างรายงาน: ${new Date().toLocaleString('th-TH')}</div>
                      <div class="summary">
                        <div class="card">โปรเจกต์ทั้งหมด: <b>${summary.totalProjects || 0}</b></div>
                        <div class="card">วันทำงานทั้งหมด: <b>${summary.totalWorkDays || 0}</b></div>
                        <div class="card">รายได้ทั้งหมด: <b>${(summary.totalEarnings || 0).toLocaleString()} บาท</b></div>
                      </div>
                      <table>
                        <thead>
                          <tr>
                            <th>ชื่อโปรเจกต์</th>
                            <th>สถานะ</th>
                            <th>วันทำงาน</th>
                            <th>อัตรา/วัน (บาท)</th>
                            <th>รวม (บาท)</th>
                            <th>มอบหมายเมื่อ</th>
                            <th>เริ่ม</th>
                            <th>สิ้นสุด</th>
                          </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                      </table>
                      <script>window.onload = () => { setTimeout(() => { window.print(); }, 200); };</script>
                    </body>
                  </html>
                `;
                w.document.open();
                w.document.write(html);
                w.document.close();
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
              title="ส่งออก PDF"
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">โปรเจกต์ทั้งหมด</p>
                <p className="text-4xl font-bold mt-2">{summary.totalProjects || 0}</p>
              </div>
              <div className="text-5xl opacity-20">📊</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">กำลังดำเนินการ</p>
                <p className="text-4xl font-bold mt-2">{summary.activeCount || 0}</p>
              </div>
              <div className="text-5xl opacity-20">✅</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">วันทำงานทั้งหมด</p>
                <p className="text-4xl font-bold mt-2">{summary.totalWorkDays || 0}</p>
              </div>
              <div className="text-5xl opacity-20">📅</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">รายได้ทั้งหมด</p>
                <p className="text-3xl font-bold mt-2">
                  {(summary.totalEarnings || 0).toLocaleString()}
                </p>
                <p className="text-orange-100 text-xs">บาท</p>
              </div>
              <div className="text-5xl opacity-20">💰</div>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span>📋</span>
              <span>รายละเอียดโปรเจกต์</span>
            </h2>
          </div>

          {assignments.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-800">
                          {assignment.project.name}
                        </h3>
                        {getStatusBadge(assignment.project.status)}
                      </div>
                      {assignment.project.description && (
                        <p className="text-gray-600 text-sm mb-3">
                          {assignment.project.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>👤</span>
                        <span>สร้างโดย: {assignment.project.creator?.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">วันเริ่มต้น</p>
                      <p className="font-semibold text-gray-800">
                        {formatDate(assignment.project.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">วันสิ้นสุด</p>
                      <p className="font-semibold text-gray-800">
                        {formatDate(assignment.project.endDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">จำนวนวันทำงาน</p>
                      <p className="font-semibold text-gray-800 flex items-center gap-1">
                        <span>📅</span>
                        <span>{assignment.workDays} วัน</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">รายได้</p>
                      <p className="font-bold text-green-600 flex items-center gap-1">
                        <span>💰</span>
                        <span>{assignment.totalCost.toLocaleString()} บาท</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <span>💵</span>
                      <span>อัตราค่าจ้าง: {assignment.dailyRate.toLocaleString()} บาท/วัน</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>📌</span>
                      <span>
                        มอบหมายเมื่อ:{' '}
                        {new Date(assignment.assignedAt).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 font-medium">ยังไม่มีโปรเจกต์ที่ได้รับมอบหมาย</p>
              <p className="text-sm text-gray-400 mt-2">
                เมื่อมีโปรเจกต์ที่คุณได้รับมอบหมาย จะแสดงที่นี่
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
