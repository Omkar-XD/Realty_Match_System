export type UserRole = 'admin' | 'staff'

export type LeadSource = 'Ads Campaign' | 'Website Form' | 'Manual Entry' | 'Phone Call' | 'Referral' | 'Walk-in'

export type EnquiryStatus = 'New Enquiry' | 'Contacted' | 'Appointment Booked' | 'Not Interested' | 'Wrong Number' | 'Closed'

export type PropertyFor = 'Rent' | 'Buy'

export type PropertyType = 'Flat' | 'Plot'

export type BHKType = '1 BHK' | '2 BHK' | '3 BHK' | '4 BHK' | '5+ BHK'

export type PropertyStatus = 'Available' | 'On Hold' | 'Sold/Rented'

export type Area = 'Dharampeth' | 'Sitabuldi' | 'Ramdaspeth' | 'Civil Lines' | 'Sadar' | 'Bajaj Nagar' | 'Manish Nagar'

export interface User {
  id: string
  full_name: string
  phone_number: string
  email: string
  password: string
  role: UserRole
  created_at: Date
}

export interface BuyerRequirement {
  area: Area | null
  property_for: PropertyFor | null
  property_type: PropertyType | null
  bhk_min: number | null
  bhk_max: number | null
  budget_min: number | null
  budget_max: number | null
  carpet_area_min: number | null
  carpet_area_max: number | null
  notes: string | null
}

export interface Enquiry {
  id: string
  customer_phone: string
  customer_name: string | null
  lead_source: LeadSource
  status: EnquiryStatus
  assigned_to_staff_id: string | null
  notes: string | null
  buyer_requirement: BuyerRequirement | null
  created_at: Date
  updated_at: Date
}

export interface Property {
  id: string
  owner_name: string
  owner_phone: string
  area: Area
  property_for: PropertyFor
  property_type: PropertyType
  bhk: BHKType | null
  price_min: number
  price_max: number
  carpet_area: number | null
  status: PropertyStatus
  notes: string | null
  added_by_user_id: string
  created_at: Date
  updated_at: Date
}

export interface PropertyWithScore extends Property {
  score: number
}
