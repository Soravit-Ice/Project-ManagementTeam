import http from './http';

export const userApi = {
  // My Projects
  getMyProjects: () => http.get('/user/my-projects'),
  exportMyProjectsExcel: () =>
    http.get('/user/my-projects/export/excel', { responseType: 'blob' }),
};

export default userApi;
