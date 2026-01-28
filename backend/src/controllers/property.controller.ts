import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PropertyService } from '../services/property.service';
import { MatchingService } from '../services/matching.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { CreatePropertyDTO } from '../types';

export class PropertyController {
  private propertyService = new PropertyService();
  private matchingService = new MatchingService();

  getAllProperties = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status } = req.query;
      const properties = await this.propertyService.getAllProperties();
      
      const filtered = status 
        ? properties.filter(p => p.status === status)
        : properties;
        
      sendSuccess(res, filtered);
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 500);
    }
  };

  getPropertyById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const property = await this.propertyService.getPropertyById(id);
      sendSuccess(res, property);
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 404);
    }
  };

  createProperty = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const propertyData: CreatePropertyDTO = req.body;
      const userId = req.user!.userId;
      const property = await this.propertyService.createProperty(propertyData, userId);
      sendSuccess(res, property, 'Property created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 400);
    }
  };

  updateProperty = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const property = await this.propertyService.updateProperty(id, updates);
      sendSuccess(res, property, 'Property updated successfully');
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 400);
    }
  };

  deleteProperty = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.propertyService.deleteProperty(id);
      sendSuccess(res, null, 'Property deleted successfully');
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 400);
    }
  };

  checkMatches = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const matches = await this.matchingService.findMatchesForProperty(id);
      sendSuccess(res, matches);
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 400);
    }
  };
}