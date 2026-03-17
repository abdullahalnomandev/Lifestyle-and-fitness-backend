import express from 'express';
import { USER_ROLES } from '../../../../enums/user';
import auth from '../../../middlewares/auth';
import { ReportController } from './report.controller';

const router = express.Router();

// Create report (user reports a post)
router.post(
  '/:postId',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ReportController.createReport
);

// Get reports of a specific post
router.get(
  '/post/:postId',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ReportController.getReportsByPost
);

// Get all reports (admin)
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ReportController.getAllReports
);

// Update report status (admin moderation)
router.patch(
  '/:reportId',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ReportController.updateReport
);

// Delete report
router.delete(
  '/:reportId',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ReportController.deleteReport
);

export const ReportRoutes = router;