import { EnquiryRepository } from '../repositories/enquiry.repository';
import { NotFoundError, ValidationError } from '../utils/error.util';
import { logger } from '../utils/logger.util';
import type { Enquiry, BuyerRequirement, EnquiryStatus } from '../types/enquiry.types';

/**
 * Enquiry Service
 * 
 * Business logic for enquiry and buyer requirement management
 */

export class EnquiryService {
  /**
   * Get enquiry by ID with buyer requirements
   */
  static async getEnquiryById(enquiryId: string): Promise<Enquiry & { buyer_requirements?: BuyerRequirement[] }> {
    const enquiry = await EnquiryRepository.findById(enquiryId);
    
    if (!enquiry) {
      throw new NotFoundError('Enquiry not found');
    }

    return enquiry;
  }

  /**
   * Get all enquiries with filters and pagination
   */
  static async getAllEnquiries(filters?: {
    status?: EnquiryStatus;
    assigned_to?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ enquiries: Enquiry[]; total: number; page: number; totalPages: number }> {
    const { enquiries, total } = await EnquiryRepository.findAll(filters);
    
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const totalPages = Math.ceil(total / limit);

    return {
      enquiries,
      total,
      page,
      totalPages
    };
  }

  /**
   * Create new enquiry
   */
  static async createEnquiry(enquiryData: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    notes?: string;
    assigned_to?: string;
  }): Promise<Enquiry> {
    // Validate phone format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(enquiryData.phone)) {
      throw new ValidationError('Invalid phone number format');
    }

    const enquiry = await EnquiryRepository.create(enquiryData);
    logger.info(`Enquiry created: ${enquiry.id} for ${enquiry.name}`);
    
    return enquiry;
  }

  /**
   * Update enquiry
   */
  static async updateEnquiry(
    enquiryId: string,
    updates: {
      name?: string;
      phone?: string;
      email?: string;
      address?: string;
      notes?: string;
      assigned_to?: string;
      status?: EnquiryStatus;
    }
  ): Promise<Enquiry> {
    // Validate phone if being updated
    if (updates.phone) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(updates.phone)) {
        throw new ValidationError('Invalid phone number format');
      }
    }

    const enquiry = await EnquiryRepository.update(enquiryId, updates);
    logger.info(`Enquiry updated: ${enquiryId}`);
    
    return enquiry;
  }

  /**
   * Delete enquiry
   */
  static async deleteEnquiry(enquiryId: string): Promise<void> {
    // Check if enquiry exists
    const enquiry = await EnquiryRepository.findById(enquiryId);
    if (!enquiry) {
      throw new NotFoundError('Enquiry not found');
    }

    await EnquiryRepository.delete(enquiryId);
    logger.info(`Enquiry deleted: ${enquiryId}`);
  }

  /**
   * Change enquiry status
   */
  static async changeEnquiryStatus(enquiryId: string, status: EnquiryStatus): Promise<Enquiry> {
    const enquiry = await EnquiryRepository.update(enquiryId, { status });
    logger.info(`Enquiry status changed: ${enquiryId} -> ${status}`);
    
    return enquiry;
  }

  // BUYER REQUIREMENTS METHODS

  /**
   * Get buyer requirement by ID
   */
  static async getRequirementById(requirementId: string): Promise<BuyerRequirement> {
    const requirement = await EnquiryRepository.findRequirementById(requirementId);
    
    if (!requirement) {
      throw new NotFoundError('Buyer requirement not found');
    }

    return requirement;
  }

  /**
   * Get all buyer requirements for an enquiry
   */
  static async getRequirementsByEnquiry(enquiryId: string): Promise<BuyerRequirement[]> {
    // Verify enquiry exists
    const enquiry = await EnquiryRepository.findById(enquiryId);
    if (!enquiry) {
      throw new NotFoundError('Enquiry not found');
    }

    return await EnquiryRepository.findRequirementsByEnquiry(enquiryId);
  }

  /**
   * Create buyer requirement
   */
  static async createRequirement(requirementData: {
    enquiry_id: string;
    property_type: string;
    property_subtype: string;
    looking_for: 'buy' | 'rent';
    budget_min: number;
    budget_max: number;
    area_min?: number;
    area_max?: number;
    preferred_areas: string[];
    notes?: string;
  }): Promise<BuyerRequirement> {
    // Verify enquiry exists
    const enquiry = await EnquiryRepository.findById(requirementData.enquiry_id);
    if (!enquiry) {
      throw new NotFoundError('Enquiry not found');
    }

    // Validate budget range
    if (requirementData.budget_max < requirementData.budget_min) {
      throw new ValidationError('Maximum budget must be greater than or equal to minimum budget');
    }

    // Validate area range if provided
    if (requirementData.area_min && requirementData.area_max) {
      if (requirementData.area_max < requirementData.area_min) {
        throw new ValidationError('Maximum area must be greater than or equal to minimum area');
      }
    }

    const requirement = await EnquiryRepository.createRequirement(requirementData);
    logger.info(`Buyer requirement created: ${requirement.id} for enquiry ${requirementData.enquiry_id}`);
    
    return requirement;
  }

  /**
   * Update buyer requirement
   */
  static async updateRequirement(
    requirementId: string,
    updates: {
      property_type?: string;
      property_subtype?: string;
      looking_for?: 'buy' | 'rent';
      budget_min?: number;
      budget_max?: number;
      area_min?: number;
      area_max?: number;
      preferred_areas?: string[];
      notes?: string;
      status?: 'active' | 'matched' | 'closed';
    }
  ): Promise<BuyerRequirement> {
    // Validate budget range if both are being updated
    if (updates.budget_min !== undefined && updates.budget_max !== undefined) {
      if (updates.budget_max < updates.budget_min) {
        throw new ValidationError('Maximum budget must be greater than or equal to minimum budget');
      }
    }

    // Validate area range if both are being updated
    if (updates.area_min !== undefined && updates.area_max !== undefined) {
      if (updates.area_max < updates.area_min) {
        throw new ValidationError('Maximum area must be greater than or equal to minimum area');
      }
    }

    const requirement = await EnquiryRepository.updateRequirement(requirementId, updates);
    logger.info(`Buyer requirement updated: ${requirementId}`);
    
    return requirement;
  }

  /**
   * Delete buyer requirement
   */
  static async deleteRequirement(requirementId: string): Promise<void> {
    // Check if requirement exists
    const requirement = await EnquiryRepository.findRequirementById(requirementId);
    if (!requirement) {
      throw new NotFoundError('Buyer requirement not found');
    }

    await EnquiryRepository.deleteRequirement(requirementId);
    logger.info(`Buyer requirement deleted: ${requirementId}`);
  }

  /**
   * Get all active buyer requirements (for matching)
   */
  static async getAllActiveRequirements(): Promise<BuyerRequirement[]> {
    return await EnquiryRepository.findAllActiveRequirements();
  }

  /**
   * Get enquiry statistics
   */
  static async getEnquiryStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    converted: number;
    closed: number;
  }> {
    const [active, inactive, converted, closed] = await Promise.all([
      EnquiryRepository.countByStatus('active'),
      EnquiryRepository.countByStatus('inactive'),
      EnquiryRepository.countByStatus('converted'),
      EnquiryRepository.countByStatus('closed')
    ]);

    return {
      total: active + inactive + converted + closed,
      active,
      inactive,
      converted,
      closed
    };
  }
}