import http from './http';

export const adminApi = {
  // Dashboard
  getDashboardStats: () => http.get('/admin/dashboard'),

  // Users
  getUsers: () => http.get('/admin/users'),
  createUser: (userData) => http.post('/admin/users', userData),
  updateUser: (userId, userData) => http.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => http.delete(`/admin/users/${userId}`),

  // Projects
  getProjects: () => http.get('/admin/projects'),
  createProject: (projectData) => http.post('/admin/projects', projectData),
  updateProject: (projectId, projectData) => http.put(`/admin/projects/${projectId}`, projectData),
  deleteProject: (projectId) => http.delete(`/admin/projects/${projectId}`),

  // Project Assignments
  getProjectAssignments: (projectId) => http.get(`/admin/projects/${projectId}/assignments`),
  assignUserToProject: (projectId, userId, workDays) =>
    http.post(`/admin/projects/${projectId}/assign`, { userId, workDays }),
  unassignUserFromProject: (projectId, userId) => http.delete(`/admin/projects/${projectId}/unassign/${userId}`),

  // Excel Import/Export
  downloadProjectTemplate: () => http.get('/admin/projects/template/download', { responseType: 'blob' }),
  uploadProjects: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return http.post('/admin/projects/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default adminApi;
