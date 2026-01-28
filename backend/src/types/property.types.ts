import { PropertyFor, PropertyType, BHKType, PropertyStatus, Area } from '../config/constants';

/**
 * Property entity from database
 */
export interface Property {
  id: string;
  owner_name: string;
  owner_phone: string;
  area: Area;
  property_for: PropertyFor;
  property_type: PropertyType;
  bhk: BHKType | null;
  price_min: number;
  price_max: number;
  carpet_area: number | null;
  status: PropertyStatus;
  notes: string | null;
  added_by_user_id: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Property with match score (for matching results)
 */
export interface PropertyWithScore extends Property {
  score: number;
}

/**
 * Create property DTO
 */
export interface CreatePropertyDto {
  owner_name: string;
  owner_phone: string;
  area: Area;
  property_for: PropertyFor;
  property_type: PropertyType;
  bhk?: BHKType | null;
  price_min: number;
  price_max: number;
  carpet_area?: number | null;
  status?: PropertyStatus;
  notes?: string | null;
}

/**
 * Update property DTO
 */
export interface UpdatePropertyDto {
  owner_name?: string;
  owner_phone?: string;
  area?: Area;
  property_for?: PropertyFor;
  property_type?: PropertyType;
  bhk?: BHKType | null;
  price_min?: number;
  price_max?: number;
  carpet_area?: number | null;
  status?: PropertyStatus;
  notes?: string | null;
}

/**
 * Property filter options
 */
export interface PropertyFilter {
  status?: PropertyStatus;
  area?: Area;
  property_for?: PropertyFor;
  property_type?: PropertyType;
  bhk?: BHKType;
  price_min?: number;
  price_max?: number;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Property with added by user name (for frontend display)
 */
export interface PropertyWithUser extends Property {
  added_by_user_name?: string;
}