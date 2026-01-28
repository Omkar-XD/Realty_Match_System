import { EnquiryStatus, LeadSource, PropertyFor, PropertyType, Area } from '../config/constants';

/**
 * Buyer Requirement nested object
 */
export interface BuyerRequirement {
  area: Area | null;
  property_for: PropertyFor | null;
  property_type: PropertyType | null;
  bhk_min: number | null;
  bhk_max: number | null;
  budget_min: number | null;
  budget_max: number | null;
  carpet_area_min: number | null;
  carpet_area_max: number | null;
  notes: string | null;
}

/**
 * Enquiry entity from database
 */
export interface Enquiry {
  id: string;
  customer_phone: string;
  customer_name: string | null;
  lead_source: LeadSource;
  status: EnquiryStatus;
  assigned_to_staff_id: string | null;
  notes: string | null;
  buyer_requirement: BuyerRequirement | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Create enquiry DTO
 */
export interface CreateEnquiryDto {
  customer_phone: string;
  customer_name?: string | null;
  lead_source: LeadSource;
  status?: EnquiryStatus;
  assigned_to_staff_id?: string | null;
  notes?: string | null;
}

/**
 * Update enquiry DTO
 */
export interface UpdateEnquiryDto {
  customer_phone?: string;
  customer_name?: string | null;
  lead_source?: LeadSource;
  status?: EnquiryStatus;
  assigned_to_staff_id?: string | null;
  notes?: string | null;
}

/**
 * Update enquiry status DTO
 */
export interface UpdateEnquiryStatusDto {
  status: EnquiryStatus;
}

/**
 * Assign enquiry DTO
 */
export interface AssignEnquiryDto {
  assigned_to_staff_id: string | null;
}

/**
 * Buyer requirement DTO (from database)
 */
export interface BuyerRequirementEntity {
  id: string;
  enquiry_id: string;
  area: Area | null;
  property_for: PropertyFor | null;
  property_type: PropertyType | null;
  bhk_min: number | null;
  bhk_max: number | null;
  budget_min: number | null;
  budget_max: number | null;
  carpet_area_min: number | null;
  carpet_area_max: number | null;
  notes: string | null;
  created_at: Date;
}

/**
 * Save buyer requirement DTO
 */
export interface SaveBuyerRequirementDto {
  area?: Area | null;
  property_for?: PropertyFor | null;
  property_type?: PropertyType | null;
  bhk_min?: number | null;
  bhk_max?: number | null;
  budget_min?: number | null;
  budget_max?: number | null;
  carpet_area_min?: number | null;
  carpet_area_max?: number | null;
  notes?: string | null;
}

/**
 * Enquiry filter options
 */
export interface EnquiryFilter {
  status?: EnquiryStatus;
  assigned_to_staff_id?: string;
  lead_source?: LeadSource;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Enquiry with staff name (for frontend display)
 */
export interface EnquiryWithStaff extends Enquiry {
  assigned_to_staff_name?: string;
}