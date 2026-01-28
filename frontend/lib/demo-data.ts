import type { User, Enquiry, Property, Area, LeadSource, EnquiryStatus, PropertyFor, PropertyType, BHKType, PropertyStatus } from './types'

// Demo Users (keep admin and staff for login)
export const demoUsers: User[] = [
  {
    id: 'admin-001',
    full_name: 'Admin User',
    phone_number: '+919876543210',
    email: 'admin@realtymatch.com',
    password: 'admin123',
    role: 'admin',
    created_at: new Date('2024-01-01')
  },
  {
    id: 'staff-001',
    full_name: 'Staff User',
    phone_number: '+919876543211',
    email: 'staff@realtymatch.com',
    password: 'staff123',
    role: 'staff',
    created_at: new Date('2024-01-15')
  }
]

// Demo Enquiries - Empty (no demo data)
export const demoEnquiries: Enquiry[] = []

// Demo Properties - Empty (no demo data)
export const demoProperties: Property[] = []
