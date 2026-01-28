import { supabase } from '../config/database';
import { DatabaseError, NotFoundError } from '../utils/error.util';
import { logger } from '../utils/logger.util';
import type { Property, PropertyStatus, PropertyType, TransactionType } from '../types/property.types';

/**
 * Property Repository
 * 
 * Handles all database operations for properties table
 */

export class PropertyRepository {
  /**
   * Find property by ID
   */
  static async findById(propertyId: string): Promise<Property | null> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new DatabaseError(`Failed to find property: ${error.message}`);
      }

      return data;
    } catch (error) {
      logger.error('Error finding property by ID:', error);
      throw error;
    }
  }

  /**
   * Find all properties with filters and pagination
   */
  static async findAll(filters?: {
    status?: PropertyStatus;
    property_type?: PropertyType;
    transaction_type?: TransactionType;
    location?: string;
    min_price?: number;
    max_price?: number;
    min_area?: number;
    max_area?: number;
    assigned_to?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ properties: Property[]; total: number }> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.property_type) {
        query = query.eq('property_type', filters.property_type);
      }

      if (filters?.transaction_type) {
        query = query.eq('transaction_type', filters.transaction_type);
      }

      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters?.min_price) {
        query = query.gte('price', filters.min_price);
      }

      if (filters?.max_price) {
        query = query.lte('price', filters.max_price);
      }

      if (filters?.min_area) {
        query = query.gte('area', filters.min_area);
      }

      if (filters?.max_area) {
        query = query.lte('area', filters.max_area);
      }

      if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }

      if (filters?.search) {
        query = query.or(
          `owner_name.ilike.%${filters.search}%,owner_phone.ilike.%${filters.search}%,location.ilike.%${filters.search}%,address.ilike.%${filters.search}%`
        );
      }

      const { data, error, count } = await query;

      if (error) {
        throw new DatabaseError(`Failed to fetch properties: ${error.message}`);
      }

      return {
        properties: data || [],
        total: count || 0
      };
    } catch (error) {
      logger.error('Error fetching properties:', error);
      throw error;
    }
  }

  /**
   * Create new property
   */
  static async create(propertyData: {
    owner_name: string;
    owner_phone: string;
    owner_email?: string;
    property_type: PropertyType;
    property_subtype: string;
    transaction_type: TransactionType;
    price: number;
    area: number;
    location: string;
    address: string;
    city?: string;
    state?: string;
    pincode?: string;
    description?: string;
    features?: string[];
    images?: string[];
    assigned_to?: string;
  }): Promise<Property> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([{
          ...propertyData,
          status: 'available'
        }])
        .select()
        .single();

      if (error) {
        throw new DatabaseError(`Failed to create property: ${error.message}`);
      }

      logger.info(`Property created: ${data.id}`);
      return data;
    } catch (error) {
      logger.error('Error creating property:', error);
      throw error;
    }
  }

  /**
   * Update property
   */
  static async update(
    propertyId: string,
    updates: Partial<Omit<Property, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Property> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', propertyId)
        .select()
        .single();

      if (error) {
        throw new DatabaseError(`Failed to update property: ${error.message}`);
      }

      if (!data) {
        throw new NotFoundError('Property not found');
      }

      logger.info(`Property updated: ${propertyId}`);
      return data;
    } catch (error) {
      logger.error('Error updating property:', error);
      throw error;
    }
  }

  /**
   * Delete property
   */
  static async delete(propertyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) {
        throw new DatabaseError(`Failed to delete property: ${error.message}`);
      }

      logger.info(`Property deleted: ${propertyId}`);
    } catch (error) {
      logger.error('Error deleting property:', error);
      throw error;
    }
  }

  /**
   * Find properties for matching with buyer requirements
   */
  static async findMatchingProperties(requirement: {
    property_type: PropertyType;
    looking_for: 'buy' | 'rent';
    budget_min: number;
    budget_max: number;
    area_min?: number;
    area_max?: number;
    preferred_areas: string[];
  }): Promise<Property[]> {
    try {
      // Build query for matching properties
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'available')
        .eq('property_type', requirement.property_type)
        .eq('transaction_type', requirement.looking_for === 'buy' ? 'sale' : 'rent')
        .gte('price', requirement.budget_min)
        .lte('price', requirement.budget_max);

      // Filter by area if specified
      if (requirement.area_min) {
        query = query.gte('area', requirement.area_min);
      }
      if (requirement.area_max) {
        query = query.lte('area', requirement.area_max);
      }

      // Filter by preferred areas (case-insensitive)
      if (requirement.preferred_areas && requirement.preferred_areas.length > 0) {
        const areaFilters = requirement.preferred_areas
          .map(area => `location.ilike.%${area}%`)
          .join(',');
        query = query.or(areaFilters);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new DatabaseError(`Failed to find matching properties: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Error finding matching properties:', error);
      throw error;
    }
  }

  /**
   * Count properties by status
   */
  static async countByStatus(status: PropertyStatus): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);

      if (error) {
        throw new DatabaseError(`Failed to count properties: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      logger.error('Error counting properties:', error);
      throw error;
    }
  }

  /**
   * Get all available properties
   */
  static async findAllAvailable(): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) {
        throw new DatabaseError(`Failed to fetch available properties: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Error fetching available properties:', error);
      throw error;
    }
  }

  /**
   * Count properties by transaction type
   */
  static async countByTransactionType(transactionType: TransactionType): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('transaction_type', transactionType)
        .eq('status', 'available');

      if (error) {
        throw new DatabaseError(`Failed to count properties: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      logger.error('Error counting properties:', error);
      throw error;
    }
  }
}