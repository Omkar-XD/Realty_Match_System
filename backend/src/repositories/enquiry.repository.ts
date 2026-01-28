import { supabase } from '../config/database';
import { DatabaseError, NotFoundError } from '../utils/error.util';
import { logger } from '../utils/logger.util';
import type { Enquiry, BuyerRequirement, EnquiryStatus } from '../types/enquiry.types';

/**
 * Enquiry Repository
 * 
 * Handles all database operations for enquiries and buyer_requirements tables
 */

export class EnquiryRepository {
  /**
   * Find enquiry by ID with buyer requirements
   */
  static async findById(enquiryId: string): Promise<(Enquiry & { buyer_requirements?: BuyerRequirement[] }) | null> {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select(`
          *,
          buyer_requirements (*)
        `)
        .eq('id', enquiryId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new DatabaseError(`Failed to find enquiry: ${error.message}`);
      }

      return data;
    } catch (error) {
      logger.error('Error finding enquiry by ID:', error);
      throw error;
    }
  }

  /**
   * Find all enquiries with filters and pagination
   */
  static async findAll(filters?: {
    status?: EnquiryStatus;
    assigned_to?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ enquiries: Enquiry[]; total: number }> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('enquiries')
        .select('*, buyer_requirements(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      const { data, error, count } = await query;

      if (error) {
        throw new DatabaseError(`Failed to fetch enquiries: ${error.message}`);
      }

      return {
        enquiries: data || [],
        total: count || 0
      };
    } catch (error) {
      logger.error('Error fetching enquiries:', error);
      throw error;
    }
  }

  /**
   * Create new enquiry
   */
  static async create(enquiryData: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    notes?: string;
    assigned_to?: string;
  }): Promise<Enquiry> {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .insert([{
          ...enquiryData,
          status: 'active'
        }])
        .select()
        .single();

      if (error) {
        throw new DatabaseError(`Failed to create enquiry: ${error.message}`);
      }

      logger.info(`Enquiry created: ${data.id}`);
      return data;
    } catch (error) {
      logger.error('Error creating enquiry:', error);
      throw error;
    }
  }

  /**
   * Update enquiry
   */
  static async update(
    enquiryId: string,
    updates: Partial<Omit<Enquiry, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Enquiry> {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .update(updates)
        .eq('id', enquiryId)
        .select()
        .single();

      if (error) {
        throw new DatabaseError(`Failed to update enquiry: ${error.message}`);
      }

      if (!data) {
        throw new NotFoundError('Enquiry not found');
      }

      logger.info(`Enquiry updated: ${enquiryId}`);
      return data;
    } catch (error) {
      logger.error('Error updating enquiry:', error);
      throw error;
    }
  }

  /**
   * Delete enquiry
   */
  static async delete(enquiryId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('enquiries')
        .delete()
        .eq('id', enquiryId);

      if (error) {
        throw new DatabaseError(`Failed to delete enquiry: ${error.message}`);
      }

      logger.info(`Enquiry deleted: ${enquiryId}`);
    } catch (error) {
      logger.error('Error deleting enquiry:', error);
      throw error;
    }
  }

  /**
   * Count enquiries by status
   */
  static async countByStatus(status: EnquiryStatus): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('enquiries')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);

      if (error) {
        throw new DatabaseError(`Failed to count enquiries: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      logger.error('Error counting enquiries:', error);
      throw error;
    }
  }

  // BUYER REQUIREMENTS METHODS

  /**
   * Find buyer requirement by ID
   */
  static async findRequirementById(requirementId: string): Promise<BuyerRequirement | null> {
    try {
      const { data, error } = await supabase
        .from('buyer_requirements')
        .select('*')
        .eq('id', requirementId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new DatabaseError(`Failed to find requirement: ${error.message}`);
      }

      return data;
    } catch (error) {
      logger.error('Error finding requirement by ID:', error);
      throw error;
    }
  }

  /**
   * Find all buyer requirements for an enquiry
   */
  static async findRequirementsByEnquiry(enquiryId: string): Promise<BuyerRequirement[]> {
    try {
      const { data, error } = await supabase
        .from('buyer_requirements')
        .select('*')
        .eq('enquiry_id', enquiryId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new DatabaseError(`Failed to fetch requirements: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Error fetching requirements:', error);
      throw error;
    }
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
    try {
      const { data, error } = await supabase
        .from('buyer_requirements')
        .insert([{
          ...requirementData,
          status: 'active'
        }])
        .select()
        .single();

      if (error) {
        throw new DatabaseError(`Failed to create requirement: ${error.message}`);
      }

      logger.info(`Buyer requirement created: ${data.id}`);
      return data;
    } catch (error) {
      logger.error('Error creating requirement:', error);
      throw error;
    }
  }

  /**
   * Update buyer requirement
   */
  static async updateRequirement(
    requirementId: string,
    updates: Partial<Omit<BuyerRequirement, 'id' | 'enquiry_id' | 'created_at' | 'updated_at'>>
  ): Promise<BuyerRequirement> {
    try {
      const { data, error } = await supabase
        .from('buyer_requirements')
        .update(updates)
        .eq('id', requirementId)
        .select()
        .single();

      if (error) {
        throw new DatabaseError(`Failed to update requirement: ${error.message}`);
      }

      if (!data) {
        throw new NotFoundError('Buyer requirement not found');
      }

      logger.info(`Buyer requirement updated: ${requirementId}`);
      return data;
    } catch (error) {
      logger.error('Error updating requirement:', error);
      throw error;
    }
  }

  /**
   * Delete buyer requirement
   */
  static async deleteRequirement(requirementId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('buyer_requirements')
        .delete()
        .eq('id', requirementId);

      if (error) {
        throw new DatabaseError(`Failed to delete requirement: ${error.message}`);
      }

      logger.info(`Buyer requirement deleted: ${requirementId}`);
    } catch (error) {
      logger.error('Error deleting requirement:', error);
      throw error;
    }
  }

  /**
   * Get all active buyer requirements (for matching)
   */
  static async findAllActiveRequirements(): Promise<BuyerRequirement[]> {
    try {
      const { data, error } = await supabase
        .from('buyer_requirements')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        throw new DatabaseError(`Failed to fetch active requirements: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Error fetching active requirements:', error);
      throw error;
    }
  }
}