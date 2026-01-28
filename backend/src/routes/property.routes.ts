import { Router } from 'express';
import { PropertyController } from '../controllers/property.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireStaffOrAdmin } from '../middleware/role.middleware';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import { 
  createLimiter, 
  updateLimiter, 
  searchLimiter, 
  matchingLimiter 
} from '../middleware/rateLimit.middleware';
import { 
  createPropertySchema, 
  updatePropertySchema,
  propertyMatchingSchema,
  propertyQuerySchema
} from '../validators/property.validator';

/**
 * Property Management Routes
 * 
 * /api/properties/*
 */

const router = Router();

/**
 * GET /api/properties
 * Get all properties with filters and pagination
 * Rate limited: 60 searches per minute
 */
router.get(
  '/',
  authenticate,
  requireStaffOrAdmin,
  searchLimiter,
  validateQuery(propertyQuerySchema),
  PropertyController.getAllProperties
);

/**
 * GET /api/properties/stats
 * Get property statistics
 */
router.get(
  '/stats',
  authenticate,
  requireStaffOrAdmin,
  PropertyController.getPropertyStats
);

/**
 * GET /api/properties/available
 * Get all available properties
 */
router.get(
  '/available',
  authenticate,
  requireStaffOrAdmin,
  searchLimiter,
  PropertyController.getAvailableProperties
);

/**
 * GET /api/properties/recent
 * Get recently added properties
 */
router.get(
  '/recent',
  authenticate,
  requireStaffOrAdmin,
  searchLimiter,
  PropertyController.getRecentProperties
);

/**
 * POST /api/properties/match
 * Find matching properties for a buyer requirement
 * Rate limited: 10 matching requests per 15 minutes
 */
router.post(
  '/match',
  authenticate,
  requireStaffOrAdmin,
  matchingLimiter,
  validateBody(propertyMatchingSchema),
  PropertyController.findMatches
);

/**
 * POST /api/properties/match/best
 * Find best matching properties with score threshold
 * Rate limited: 10 matching requests per 15 minutes
 */
router.post(
  '/match/best',
  authenticate,
  requireStaffOrAdmin,
  matchingLimiter,
  PropertyController.findBestMatches
);

/**
 * GET /api/properties/:id
 * Get property by ID
 */
router.get(
  '/:id',
  authenticate,
  requireStaffOrAdmin,
  PropertyController.getPropertyById
);

/**
 * POST /api/properties
 * Create new property
 * Rate limited: 20 creations per hour
 */
router.post(
  '/',
  authenticate,
  requireStaffOrAdmin,
  createLimiter,
  validateBody(createPropertySchema),
  PropertyController.createProperty
);

/**
 * PUT /api/properties/:id
 * Update property
 * Rate limited: 30 updates per hour
 */
router.put(
  '/:id',
  authenticate,
  requireStaffOrAdmin,
  updateLimiter,
  validateBody(updatePropertySchema),
  PropertyController.updateProperty
);

/**
 * PATCH /api/properties/:id/status
 * Change property status
 */
router.patch(
  '/:id/status',
  authenticate,
  requireStaffOrAdmin,
  updateLimiter,
  PropertyController.changeStatus
);

/**
 * DELETE /api/properties/:id
 * Delete property
 */
router.delete(
  '/:id',
  authenticate,
  requireStaffOrAdmin,
  PropertyController.deleteProperty
);

export default router;