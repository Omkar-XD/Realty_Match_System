import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { EnquiryService } from '../services/enquiry.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { CreateEnquiryDTO } from '../types';

export class EnquiryController {
  private enquiryService = new EnquiryService();

  getAllEnquiries = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status } = req.query;
      const enquiries = status 
        ? await this.enquiryService.getEnquiriesByStatus(status as string)
        : await this.enquiryService.getAllEnquiries();
      sendSuccess(res, enquiries);
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 500);
    }
  };

  getEnquiryById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const enquiry = await this.enquiryService.getEnquiryById(id);
      sendSuccess(res, enquiry);
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 404);
    }
  };

  createEnquiry = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const enquiryData: CreateEnquiryDTO = req.body;
      const userId = req.user!.userId;
      const enquiry = await this.enquiryService.createEnquiry(enquiryData, userId);
      sendSuccess(res, enquiry, 'Enquiry created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 400);
    }
  };

  updateEnquiry = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const enquiry = await this.enquiryService.updateEnquiry(id, updates);
      sendSuccess(res, enquiry, 'Enquiry updated successfully');
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 400);
    }
  };

  deleteEnquiry = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.enquiryService.deleteEnquiry(id);
      sendSuccess(res, null, 'Enquiry deleted successfully');
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 400);
    }
  };

  addRequirement = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const requirement = req.body;
      const enquiry = await this.enquiryService.addRequirement(id, requirement);
      sendSuccess(res, enquiry, 'Requirement added successfully');
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 400);
    }
  };

  removeRequirement = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id, requirementId } = req.params;
      const enquiry = await this.enquiryService.removeRequirement(id, requirementId);
      sendSuccess(res, enquiry, 'Requirement removed successfully');
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 400);
    }
  };
}