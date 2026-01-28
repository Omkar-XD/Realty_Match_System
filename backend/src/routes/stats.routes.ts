import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireStaffOrAdmin } from '../middleware/role.middleware';
import { searchLimiter } from '../middleware/rateLimit.middleware';

/**
 * Statistics & Analytics Routes
 * 
 * /api/stats/*
 */

const router = Router();

/**
 * GET /api/stats/dashboard
 * Get comprehensive dashboard statistics
 * All authenticated users can view (filtered by role)
 */
router.get(
  '/dashboard',
  authenticate,
  requireStaffOrAdmin,
  searchLimiter,
  StatsController.getDashboardStats
);

/**
 * GET /api/stats/enquiries
 * Get detailed enquiry statistics
 * Staff and admin
 */
router.get(
  '/enquiries',
  authenticate,
  requireStaffOrAdmin,
  searchLimiter,
  StatsController.getEnquiryStats
);

/**
 * GET /api/stats/properties
 * Get detailed property statistics
 * Staff and admin
 */
router.get(
  '/properties',
  authenticate,
  requireStaffOrAdmin,
  searchLimiter,
  StatsController.getPropertyStats
);

/**
 * GET /api/stats/activity
 * Get activity timeline (last 30 days)
 * Staff and admin
 */
router.get(
  '/activity',
  authenticate,
  requireStaffOrAdmin,
  searchLimiter,
  StatsController.getActivityTimeline
);

/**
 * GET /api/stats/performance
 * Get user performance statistics
 * Admin only
 */
router.get(
  '/performance',
  authenticate,
  requireAdmin,
  searchLimiter,
  StatsController.getUserPerformance
);

/**
 * GET /api/stats/overview
 * Get quick overview statistics
 * Staff and admin
 */
router.get(
  '/overview',
  authenticate,
  requireStaffOrAdmin,
  searchLimiter,
  StatsController.getOverview
);

/**
 * GET /api/stats/summary
 * Get summary statistics for specific period
 * Staff and admin
 */
router.get(
  '/summary',
  authenticate,
  requireStaffOrAdmin,
  searchLimiter,
  StatsController.getSummary
);

export default router;