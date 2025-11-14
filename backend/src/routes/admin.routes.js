import { Router } from 'express';
import { asyncHandler } from '../middleware/error.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { uploadExcel } from '../middleware/upload.js';
import {
  getDashboardStatsController,
  getUsersController,
  createUserController,
  updateUserController,
  deleteUserController,
  getProjectsController,
  createProjectController,
  updateProjectController,
  deleteProjectController,
  assignUserToProjectController,
  unassignUserFromProjectController,
  getProjectAssignmentsController,
  downloadProjectTemplateController,
  uploadProjectsController,
} from '../controllers/admin.controller.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

router.get('/dashboard', asyncHandler(getDashboardStatsController));
router.get('/users', asyncHandler(getUsersController));
router.post('/users', asyncHandler(createUserController));
router.put('/users/:id', asyncHandler(updateUserController));
router.delete('/users/:id', asyncHandler(deleteUserController));

// Excel import/export (must come before :id routes)
router.get('/projects/template/download', asyncHandler(downloadProjectTemplateController));
router.post('/projects/upload', uploadExcel.single('file'), asyncHandler(uploadProjectsController));

router.get('/projects', asyncHandler(getProjectsController));
router.post('/projects', asyncHandler(createProjectController));
router.put('/projects/:id', asyncHandler(updateProjectController));
router.delete('/projects/:id', asyncHandler(deleteProjectController));
router.get('/projects/:id/assignments', asyncHandler(getProjectAssignmentsController));
router.post('/projects/:id/assign', asyncHandler(assignUserToProjectController));
router.delete('/projects/:id/unassign/:userId', asyncHandler(unassignUserFromProjectController));

export default router;
