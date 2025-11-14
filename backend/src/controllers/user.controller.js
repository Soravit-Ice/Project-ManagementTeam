import prisma from '../lib/prisma.js';
import XLSX from 'xlsx';

// Get user's assigned projects
export const getMyProjectsController = async (req, res) => {
  const userId = req.user.id;

  // Get all project assignments for this user
  const assignments = await prisma.projectAssignment.findMany({
    where: { userId },
    include: {
      project: {
        include: {
          creator: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { assignedAt: 'desc' },
  });

  // Calculate totals
  const totalProjects = assignments.length;
  const totalWorkDays = assignments.reduce((sum, a) => sum + a.workDays, 0);
  const totalEarnings = assignments.reduce((sum, a) => sum + a.totalCost, 0);

  // Group by project status
  const activeProjects = assignments.filter((a) => a.project.status === 'ACTIVE');
  const completedProjects = assignments.filter((a) => a.project.status === 'EXPIRED');
  const lockedProjects = assignments.filter((a) => a.project.status === 'LOCKED');

  res.json({
    data: {
      assignments,
      summary: {
        totalProjects,
        totalWorkDays,
        totalEarnings,
        activeCount: activeProjects.length,
        completedCount: completedProjects.length,
        lockedCount: lockedProjects.length,
      },
    },
  });
};

// Export user's assigned projects to Excel
export const exportMyProjectsExcelController = async (req, res) => {
  const userId = req.user.id;

  const assignments = await prisma.projectAssignment.findMany({
    where: { userId },
    include: {
      project: {
        include: {
          creator: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { assignedAt: 'desc' },
  });

  // Prepare data rows
  const rows = assignments.map((a) => ({
    'Project Name': a.project.name,
    Description: a.project.description || '',
    'Start Date': a.project.startDate
      ? new Date(a.project.startDate).toISOString().slice(0, 10)
      : '',
    'End Date': a.project.endDate
      ? new Date(a.project.endDate).toISOString().slice(0, 10)
      : '',
    Status: a.project.status,
    'Work Days': a.workDays,
    'Daily Rate': a.dailyRate,
    'Total Cost': a.totalCost,
    'Assigned At': new Date(a.assignedAt).toISOString().slice(0, 10),
    'Creator Name': a.project.creator?.name || '',
    'Creator Email': a.project.creator?.email || '',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  // Auto width
  const colWidths = Object.keys(rows[0] || { Dummy: '' }).map((key) => ({ wch: Math.max(12, key.length + 2) }));
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'My Projects');

  // Summary sheet
  const totalProjects = assignments.length;
  const totalWorkDays = assignments.reduce((sum, a) => sum + a.workDays, 0);
  const totalEarnings = assignments.reduce((sum, a) => sum + a.totalCost, 0);
  const summaryRows = [
    { Metric: 'Total Projects', Value: totalProjects },
    { Metric: 'Total Work Days', Value: totalWorkDays },
    { Metric: 'Total Earnings (THB)', Value: totalEarnings },
  ];
  const ws2 = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, ws2, 'Summary');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const filename = `my-projects-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate()
  )}-${pad(now.getHours())}${pad(now.getMinutes())}.xlsx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.send(buf);
};
