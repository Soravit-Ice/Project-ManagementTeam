import { useEffect, useState } from 'react';
import adminApi from '../../api/admin';
import ProjectModal from '../../components/admin/ProjectModal';
import AssignUserModal from '../../components/admin/AssignUserModal';
import ExcelUploadModal from '../../components/admin/ExcelUploadModal';

export default function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  // Must be declared before any early returns to keep hooks order stable
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const { data } = await adminApi.getProjects();
      setProjects(data.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAdd = () => {
    setEditingProject(null);
    setProjectModalOpen(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setProjectModalOpen(true);
  };

  const handleDelete = async (projectId) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบโปรเจกต์นี้?')) return;

    try {
      await adminApi.deleteProject(projectId);
      fetchProjects();
    } catch (error) {
      alert('ไม่สามารถลบโปรเจกต์ได้: ' + (error.response?.data?.error?.message || error.message));
    }
  };

  const handleSave = async (projectData) => {
    try {
      if (editingProject) {
        await adminApi.updateProject(editingProject.id, projectData);
      } else {
        await adminApi.createProject(projectData);
      }
      setProjectModalOpen(false);
      fetchProjects();
    } catch (error) {
      throw error;
    }
  };

  const handleAssignClick = (project) => {
    setSelectedProject(project);
    setAssignModalOpen(true);
  };

  const handleAssign = async (userId, workDays) => {
    try {
      await adminApi.assignUserToProject(selectedProject.id, userId, workDays);
      fetchProjects();
    } catch (error) {
      throw error;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      LOCKED: 'bg-yellow-100 text-yellow-800',
      EXPIRED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount);
  };

  if (loading) {
    return <div className="p-6">กำลังโหลด...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">จัดการโปรเจกต์</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <span>📤</span>
            <span>Import Excel</span>
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + เพิ่มโปรเจกต์
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ชื่อโปรเจกต์
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  วันเริ่มต้น
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  วันสิ้นสุด
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ต้นทุน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Assigned
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  การกระทำ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                    {project.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {project.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(project.startDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(project.endDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(project.internalCost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.assignments?.length || 0} คน
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleAssignClick(project)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {projectModalOpen && (
        <ProjectModal
          project={editingProject}
          onClose={() => setProjectModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {assignModalOpen && selectedProject && (
        <AssignUserModal
          project={selectedProject}
          onClose={() => setAssignModalOpen(false)}
          onAssign={handleAssign}
        />
      )}

      {uploadModalOpen && (
        <ExcelUploadModal
          onClose={() => setUploadModalOpen(false)}
          onSuccess={fetchProjects}
        />
      )}
    </div>
  );
}
