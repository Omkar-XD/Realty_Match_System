import { PropertyRepository } from '../repositories/property.repository';
import { NotFoundError, ValidationError } from '../utils/error.util';
import { logger } from '../utils/logger.util';
import type { Property, PropertyStatus, PropertyType, TransactionType } from '../types/property.types';

/**
 * Property Service
 * 
 * Business logic for property management
 */

export class PropertyService {
  /**
   * Get property by ID
   */
  static async getPropertyById(propertyId: string): Promise<Property> {
    const property = await PropertyRepository.findById(propertyId);
    
    if (!property) {
      throw new NotFoundError('Property not found');
    }

    return property;
  }

  /**
   * Get all properties with filters and pagination
   */
  static async getAllProperties(filters?: {
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
  }): Promise<{ properties: Property[]; total: number; page: number; totalPages: number }> {
    const { properties, total } = await PropertyRepository.findAll(filters);
    
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const totalPages = Math.ceil(total / limit);

    return {
      properties,
      total,
      page,
      totalPages
    };
  }

  /**
   * Create new property
   */
  static async createProperty(propertyData: {
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
    // Validate phone format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(propertyData.owner_phone)) {
      throw new ValidationError('Invalid phone number format');
    }

    // Validate price and area
    if (propertyData.price < 100000) {
      throw new ValidationError('Price must be at least ₹1 lakh');
    }

    if (propertyData.area < 100) {
      throw new ValidationError('Area must be at least 100 sq.ft.');
    }

    const property = await PropertyRepository.create(propertyData);
    logger.info(`Property created: ${property.id} at ${property.location}`);
    
    return property;
  }

  /**
   * Update property
   */
  static async updateProperty(
    propertyId: string,
    updates: {
      owner_name?: string;
      owner_phone?: string;
      owner_email?: string;
      property_type?: PropertyType;
      property_subtype?: string;
      transaction_type?: TransactionType;
      price?: number;
      area?: number;
      location?: string;
      address?: string;
      city?: string;
      state?: string;
      pincode?: string;
      description?: string;
      features?: string[];
      images?: string[];
      assigned_to?: string;
      status?: PropertyStatus;
    }
  ): Promise<Property> {
    // Validate phone if being updated
    if (updates.owner_phone) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(updates.owner_phone)) {
        throw new ValidationError('Invalid phone number format');
      }
    }

    // Validate price if being updated
    if (updates.price !== undefined && updates.price < 100000) {
      throw new ValidationError('Price must be at least ₹1 lakh');
    }

    // Validate area if being updated
    if (updates.area !== undefined && updates.area < 100) {
      throw new ValidationError('Area must be at least 100 sq.ft.');
    }

    const property = await PropertyRepository.update(propertyId, updates);
    logger.info(`Property updated: ${propertyId}`);
    
    return property;
  }

  /**
   * Delete property
   */
  static async deleteProperty(propertyId: string): Promise<void> {
    // Check if property exists
    const property = await PropertyRepository.findById(propertyId);
    if (!property) {
      throw new NotFoundError('Property not found');
    }

    await PropertyRepository.delete(propertyId);
    logger.info(`Property deleted: ${propertyId}`);
  }

  /**
   * Change property status
   */
  static async changePropertyStatus(propertyId: string, status: PropertyStatus): Promise<Property> {
    const property = await PropertyRepository.update(propertyId, { status });
    logger.info(`Property status changed: ${propertyId} -> ${status}`);
    
    return property;
  }

  /**
   * Get all available properties
   */
  static async getAvailableProperties(): Promise<Property[]> {
    return await PropertyRepository.findAllAvailable();
  }

  /**
   * Search properties by location
   */
  static async searchByLocation(location: string, limit?: number): Promise<Property[]> {
    const { properties } = await PropertyRepository.findAll({
      location,
      status: 'available',
      limit: limit || 20
    });

    return properties;
  }

  /**
   * Get properties by price range
   */
  static async getPropertiesByPriceRange(
    minPrice: number,
    maxPrice: number,
    transactionType?: TransactionType
  ): Promise<Property[]> {
    const { properties } = await PropertyRepository.findAll({
      min_price: minPrice,
      max_price: maxPrice,
      transaction_type: transactionType,
      status: 'available'
    });

    return properties;
  }

  /**
   * Get property statistics
   */
  static async getPropertyStats(): Promise<{
    total: number;
    available: number;
    sold: number;
    rented: number;
    under_negotiation: number;
    forSale: number;
    forRent: number;
  }> {
    const [available, sold, rented, underNegotiation, forSale, forRent] = await Promise.all([
      PropertyRepository.countByStatus('available'),
      PropertyRepository.countByStatus('sold'),
      PropertyRepository.countByStatus('rented'),
      PropertyRepository.countByStatus('under_negotiation'),
      PropertyRepository.countByTransactionType('sale'),
      PropertyRepository.countByTransactionType('rent')
    ]);

    return {
      total: available + sold + rented + underNegotiation,
      available,
      sold,
      rented,
      under_negotiation: underNegotiation,
      forSale,
      forRent
    };
  }

  /**
   * Get properties by type
   */
  static async getPropertiesByType(propertyType: PropertyType): Promise<Property[]> {
    const { properties } = await PropertyRepository.findAll({
      property_type: propertyType,
      status: 'available'
    });

    return properties;
  }

  /**
   * Get recently added properties
   */
  static async getRecentProperties(limit: number = 10): Promise<Property[]> {
    const { properties } = await PropertyRepository.findAll({
      status: 'available',
      limit
    });

    return properties;
  }
}