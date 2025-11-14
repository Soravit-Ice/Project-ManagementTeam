import { Router } from 'express';
import { asyncHandler } from '../middleware/error.js';
import { authenticate } from '../middleware/auth.js';
import { getMyProjectsController, exportMyProjectsExcelController } from '../controllers/user.controller.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/my-projects', asyncHandler(getMyProjectsController));
router.get('/my-projects/export/excel', asyncHandler(exportMyProjectsExcelController));

export default router;
