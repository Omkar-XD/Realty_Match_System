import { Request, Response } from 'express';
import { EnquiryService } from '../services/enquiry.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { logger } from '../utils/logger.util';

/**
 * Enquiry Controller
 * 
 * Handles enquiry and buyer requirement HTTP requests
 */

export class EnquiryController {
  /**
   * GET /api/enquiries
   * Get all enquiries with filters and pagination
   */
  static async getAllEnquiries(req: Request, res: Response): Promise<void> {
    try {
      const { status, assigned_to, search, page, limit } = req.query;

      const filters: any = {};
      if (status) filters.status = status;
      if (assigned_to) filters.assigned_to = assigned_to;
      if (search) filters.search = search as string;
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);

      const result = await EnquiryService.getAllEnquiries(filters);

      res.status(200).json(
        successResponse('Enquiries retrieved successfully', result)
      );
    } catch (error: any) {
      logger.error('Get all enquiries error:', error);
      res.status(500).json(
        errorResponse('Failed to retrieve enquiries', 500)
      );
    }
  }

  /**
   * GET /api/enquiries/:id
   * Get enquiry by ID with buyer requirements
   */
  static async getEnquiryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const enquiry = await EnquiryService.getEnquiryById(id);

      res.status(200).json(
        successResponse('Enquiry retrieved successfully', { enquiry })
      );
    } catch (error: any) {
      logger.error('Get enquiry by ID error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Failed to retrieve enquiry', error.statusCode || 500)
      );
    }
  }

  /**
   * POST /api/enquiries
   * Create new enquiry
   */
  static async createEnquiry(req: Request, res: Response): Promise<void> {
    try {
      const enquiryData = req.body;
      const enquiry = await EnquiryService.createEnquiry(enquiryData);

      res.status(201).json(
        successResponse('Enquiry created successfully', { enquiry })
      );
    } catch (error: any) {
      logger.error('Create enquiry error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Failed to create enquiry', error.statusCode || 500)
      );
    }
  }

  /**
   * PUT /api/enquiries/:id
   * Update enquiry
   */
  static async updateEnquiry(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const enquiry = await EnquiryService.updateEnquiry(id, updates);

      res.status(200).json(
        successResponse('Enquiry updated successfully', { enquiry })
      );
    } catch (error: any) {
      logger.error('Update enquiry error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Failed to update enquiry', error.statusCode || 500)
      );
    }
  }

  /**
   * DELETE /api/enquiries/:id
   * Delete enquiry
   */
  static async deleteEnquiry(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await EnquiryService.deleteEnquiry(id);

      res.status(200).json(
        successResponse('Enquiry deleted successfully')
      );
    } catch (error: any) {
      logger.error('Delete enquiry error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Failed to delete enquiry', error.statusCode || 500)
      );
    }
  }

  /**
   * PATCH /api/enquiries/:id/status
   * Change enquiry status
   */
  static async changeStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const enquiry = await EnquiryService.changeEnquiryStatus(id, status);

      res.status(200).json(
        successResponse('Enquiry status updated successfully', { enquiry })
      );
    } catch (error: any) {
      logger.error('Change enquiry status error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Failed to change enquiry status', error.statusCode || 500)
      );
    }
  }

  // BUYER REQUIREMENTS ENDPOINTS

  /**
   * GET /api/enquiries/:id/requirements
   * Get all buyer requirements for an enquiry
   */
  static async getRequirements(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const requirements = await EnquiryService.getRequirementsByEnquiry(id);

      res.status(200).json(
        successResponse('Buyer requirements retrieved successfully', { 
          requirements, 
          total: requirements.length 
        })
      );
    } catch (error: any) {
      logger.error('Get requirements error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Failed to retrieve requirements', error.statusCode || 500)
      );
    }
  }

  /**
   * POST /api/enquiries/:id/requirements
   * Create buyer requirement for an enquiry
   */
  static async createRequirement(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const requirementData = { ...req.body, enquiry_id: id };

      const requirement = await EnquiryService.createRequirement(requirementData);

      res.status(201).json(
        successResponse('Buyer requirement created successfully', { requirement })
      );
    } catch (error: any) {
      logger.error('Create requirement error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Failed to create requirement', error.statusCode || 500)
      );
    }
  }

  /**
   * GET /api/requirements/:id
   * Get buyer requirement by ID
   */
  static async getRequirementById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const requirement = await EnquiryService.getRequirementById(id);

      res.status(200).json(
        successResponse('Buyer requirement retrieved successfully', { requirement })
      );
    } catch (error: any) {
      logger.error('Get requirement by ID error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Failed to retrieve requirement', error.statusCode || 500)
      );
    }
  }

  /**
   * PUT /api/requirements/:id
   * Update buyer requirement
   */
  static async updateRequirement(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const requirement = await EnquiryService.updateRequirement(id, updates);

      res.status(200).json(
        successResponse('Buyer requirement updated successfully', { requirement })
      );
    } catch (error: any) {
      logger.error('Update requirement error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Failed to update requirement', error.statusCode || 500)
      );
    }
  }

  /**
   * DELETE /api/requirements/:id
   * Delete buyer requirement
   */
  static async deleteRequirement(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await EnquiryService.deleteRequirement(id);

      res.status(200).json(
        successResponse('Buyer requirement deleted successfully')
      );
    } catch (error: any) {
      logger.error('Delete requirement error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Failed to delete requirement', error.statusCode || 500)
      );
    }
  }

  /**
   * GET /api/requirements/active
   * Get all active buyer requirements
   */
  static async getActiveRequirements(req: Request, res: Response): Promise<void> {
    try {
      const requirements = await EnquiryService.getAllActiveRequirements();

      res.status(200).json(
        successResponse('Active buyer requirements retrieved successfully', { 
          requirements, 
          total: requirements.length 
        })
      );
    } catch (error: any) {
      logger.error('Get active requirements error:', error);
      res.status(500).json(
        errorResponse('Failed to retrieve active requirements', 500)
      );
    }
  }

  /**
   * GET /api/enquiries/stats
   * Get enquiry statistics
   */
  static async getEnquiryStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await EnquiryService.getEnquiryStats();

      res.status(200).json(
        successResponse('Enquiry statistics retrieved successfully', { stats })
      );
    } catch (error: any) {
      logger.error('Get enquiry stats error:', error);
      res.status(500).json(
        errorResponse('Failed to retrieve enquiry statistics', 500)
      );
    }
  }
}