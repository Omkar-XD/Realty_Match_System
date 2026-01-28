import { Request, Response } from 'express';
import { PropertyService } from '../services/property.service';
import { MatchingService } from '../services/matching.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { logger } from '../utils/logger.util';

/**
 * Property Controller
 * 
 * Handles property management HTTP requests
 */

export class PropertyController {
  /**
   * GET /api/properties
   * Get all properties with filters and pagination
   */
  static async getAllProperties(req: Request, res: Response): Promise<void> {
    try {
      const { 
        status, 
        property_type, 
        transaction_type, 
        location,
        min_price,
        max_price,
        min_area,
        max_area,
        assigned_to,
        search, 
        page, 
        limit 
      } = req.query;

      const filters: any = {};
      if (status) filters.status = status;
      if (property_type) filters.property_type = property_type;
      if (transaction_type) filters.transaction_type = transaction_type;
      if (location) filters.location = location as string;
      if (min_price) filters.min_price = parseInt(min_price as string);
      if (max_price) filters.max_price = parseInt(max_price as string);
      if (min_area) filters.min_area = parseFloat(min_area as string);
      if (max_area) filters.max_area = parseFloat(max_area as string);
      if (assigned_to) filters.assigned_to = assigned_to;
      if (search) filters.search = search as string;
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);

      const result = await PropertyService.getAllProperties(filters);

      res.status(200).json(
        successResponse('Properties retrieved successfully', result)
      );
    } catch (error: any) {
      logger.error('Get all properties error:', error);
      res.status(500).json(
        errorResponse('Failed to retrieve properties', 500)
      );
    }
  }

  /**
   * GET /api/properties/:id
   * Get property by ID
   */
  static async getPropertyById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const property = await PropertyService.getPropertyById(id);

      res.status(200).json(
        successResponse('Property retrieved successfully', { property })
      );
    } catch (error: any) {
      logger.error('Get property by ID error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Failed to retrieve property', error.statusCode || 500)
      );
    }
  }

  /**
   * POST /api/properties
   * Create new property
   */
  static async createProperty(req: Request, res: Response): Promise<void> {
    try {
      const propertyData = req.body;
      const property = await PropertyService.createProperty(propertyData);

      res.status(201).json(
        successResponse('Property created successfully', { property })
      );
    } catch (error: any) {
      logger.error('Create property error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Failed to create property', error.statusCode || 500)
      );
    }
  }

  /**
   * PUT /api/properties/:id
   * Update property
   */
  static async updateProperty(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const property = await PropertyService.updateProperty(id, updates);

      res.status(200).json(
        successResponse('Property updated successfully', { property })
      );
    } catch (error: any) {
      logger.error('Update property error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Failed to update property', error.statusCode || 500)
      );
    }
  }

  /**
   * DELETE /api/properties/:id
   * Delete property
   */
  static async deleteProperty(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await PropertyService.deleteProperty(id);

      res.status(200).json(
        successResponse('Property deleted successfully')
      );
    } catch (error: any) {
      logger.error('Delete property error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Failed to delete property', error.statusCode || 500)
      );
    }
  }

  /**
   * PATCH /api/properties/:id/status
   * Change property status
   */
  static async changeStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const property = await PropertyService.changePropertyStatus(id, status);

      res.status(200).json(
        successResponse('Property status updated successfully', { property })
      );
    } catch (error: any) {
      logger.error('Change property status error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Failed to change property status', error.statusCode || 500)
      );
    }
  }

  /**
   * GET /api/properties/available
   * Get all available properties
   */
  static async getAvailableProperties(req: Request, res: Response): Promise<void> {
    try {
      const properties = await PropertyService.getAvailableProperties();

      res.status(200).json(
        successResponse('Available properties retrieved successfully', { 
          properties, 
          total: properties.length 
        })
      );
    } catch (error: any) {
      logger.error('Get available properties error:', error);
      res.status(500).json(
        errorResponse('Failed to retrieve available properties', 500)
      );
    }
  }

  /**
   * GET /api/properties/recent
   * Get recently added properties
   */
  static async getRecentProperties(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const properties = await PropertyService.getRecentProperties(limit);

      res.status(200).json(
        successResponse('Recent properties retrieved successfully', { 
          properties, 
          total: properties.length 
        })
      );
    } catch (error: any) {
      logger.error('Get recent properties error:', error);
      res.status(500).json(
        errorResponse('Failed to retrieve recent properties', 500)
      );
    }
  }

  /**
   * POST /api/properties/match
   * Find matching properties for a buyer requirement
   */
  static async findMatches(req: Request, res: Response): Promise<void> {
    try {
      const { requirement_id } = req.body;

      if (!requirement_id) {
        res.status(400).json(
          errorResponse('Requirement ID is required', 400)
        );
        return;
      }

      const result = await MatchingService.findMatchingProperties(requirement_id);

      res.status(200).json(
        successResponse('Matching properties found successfully', result)
      );
    } catch (error: any) {
      logger.error('Find matches error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Failed to find matching properties', error.statusCode || 500)
      );
    }
  }

  /**
   * POST /api/properties/match/best
   * Find best matching properties (with score threshold)
   */
  static async findBestMatches(req: Request, res: Response): Promise<void> {
    try {
      const { requirement_id, min_score, limit } = req.body;

      if (!requirement_id) {
        res.status(400).json(
          errorResponse('Requirement ID is required', 400)
        );
        return;
      }

      const matches = await MatchingService.findBestMatches(
        requirement_id,
        min_score || 60,
        limit || 10
      );

      res.status(200).json(
        successResponse('Best matches found successfully', { 
          matches, 
          total: matches.length 
        })
      );
    } catch (error: any) {
      logger.error('Find best matches error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Failed to find best matches', error.statusCode || 500)
      );
    }
  }

  /**
   * GET /api/properties/stats
   * Get property statistics
   */
  static async getPropertyStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await PropertyService.getPropertyStats();

      res.status(200).json(
        successResponse('Property statistics retrieved successfully', { stats })
      );
    } catch (error: any) {
      logger.error('Get property stats error:', error);
      res.status(500).json(
        errorResponse('Failed to retrieve property statistics', 500)
      );
    }
  }
}