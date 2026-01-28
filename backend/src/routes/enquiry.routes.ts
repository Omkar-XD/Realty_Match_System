import { Router } from 'express';
import { EnquiryController } from '../controllers/enquiry.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireStaffOrAdmin } from '../middleware/role.middleware';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import { createLimiter, updateLimiter, searchLimiter } from '../middleware/rateLimit.middleware';
import { 
  createEnquirySchema, 
  updateEnquirySchema,
  createBuyerRequirementSchema,
  updateBuyerRequirementSchema,
  enquiryQuerySchema
} from '../validators/enquiry.validator';

/**
 * Enquiry Management Routes
 * 
 * /api/enquiries/*
 */

const router = Router();

/**
 * GET /api/enquiries
 * Get all enquiries with filters and pagination
 * Staff and admin can view enquiries
 * Rate limited: 60 searches per minute
 */
router.get(
  '/',
  authenticate,
  requireStaffOrAdmin,
  searchLimiter,
  validateQuery(enquiryQuerySchema),
  EnquiryController.getAllEnquiries
);

/**
 * GET /api/enquiries/stats
 * Get enquiry statistics
 */
router.get(
  '/stats',
  authenticate,
  requireStaffOrAdmin,
  EnquiryController.getEnquiryStats
);

/**
 * GET /api/enquiries/:id
 * Get enquiry by ID with buyer requirements
 */
router.get(
  '/:id',
  authenticate,
  requireStaffOrAdmin,
  EnquiryController.getEnquiryById
);

/**
 * POST /api/enquiries
 * Create new enquiry
 * Rate limited: 20 creations per hour
 */
router.post(
  '/',
  authenticate,
  requireStaffOrAdmin,
  createLimiter,
  validateBody(createEnquirySchema),
  EnquiryController.createEnquiry
);

/**
 * PUT /api/enquiries/:id
 * Update enquiry
 * Rate limited: 30 updates per hour
 */
router.put(
  '/:id',
  authenticate,
  requireStaffOrAdmin,
  updateLimiter,
  validateBody(updateEnquirySchema),
  EnquiryController.updateEnquiry
);

/**
 * PATCH /api/enquiries/:id/status
 * Change enquiry status
 */
router.patch(
  '/:id/status',
  authenticate,
  requireStaffOrAdmin,
  updateLimiter,
  EnquiryController.changeStatus
);

/**
 * DELETE /api/enquiries/:id
 * Delete enquiry
 */
router.delete(
  '/:id',
  authenticate,
  requireStaffOrAdmin,
  EnquiryController.deleteEnquiry
);

// BUYER REQUIREMENTS ROUTES

/**
 * GET /api/enquiries/:id/requirements
 * Get all buyer requirements for an enquiry
 */
router.get(
  '/:id/requirements',
  authenticate,
  requireStaffOrAdmin,
  EnquiryController.getRequirements
);

/**
 * POST /api/enquiries/:id/requirements
 * Create buyer requirement for an enquiry
 * Rate limited: 20 creations per hour
 */
router.post(
  '/:id/requirements',
  authenticate,
  requireStaffOrAdmin,
  createLimiter,
  validateBody(createBuyerRequirementSchema),
  EnquiryController.createRequirement
);

/**
 * GET /api/requirements/active
 * Get all active buyer requirements
 */
router.get(
  '/requirements/active',
  authenticate,
  requireStaffOrAdmin,
  searchLimiter,
  EnquiryController.getActiveRequirements
);

/**
 * GET /api/requirements/:id
 * Get buyer requirement by ID
 */
router.get(
  '/requirements/:id',
  authenticate,
  requireStaffOrAdmin,
  EnquiryController.getRequirementById
);

/**
 * PUT /api/requirements/:id
 * Update buyer requirement
 * Rate limited: 30 updates per hour
 */
router.put(
  '/requirements/:id',
  authenticate,
  requireStaffOrAdmin,
  updateLimiter,
  validateBody(updateBuyerRequirementSchema),
  EnquiryController.updateRequirement
);

/**
 * DELETE /api/requirements/:id
 * Delete buyer requirement
 */
router.delete(
  '/requirements/:id',
  authenticate,
  requireStaffOrAdmin,
  EnquiryController.deleteRequirement
);

export default router;