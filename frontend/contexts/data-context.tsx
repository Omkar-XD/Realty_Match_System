'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Enquiry, Property, BuyerRequirement, EnquiryStatus, PropertyWithScore } from '@/lib/types'
import { demoEnquiries, demoProperties, demoUsers } from '@/lib/demo-data'

interface DataContextType {
  enquiries: Enquiry[]
  properties: Property[]
  users: typeof demoUsers
  addEnquiry: (enquiry: Omit<Enquiry, 'id' | 'created_at' | 'updated_at'>) => void
  updateEnquiry: (id: string, updates: Partial<Enquiry>) => void
  deleteEnquiry: (id: string) => void
  updateEnquiryStatus: (id: string, status: EnquiryStatus) => void
  assignEnquiry: (id: string, staffId: string | null) => void
  saveBuyerRequirement: (enquiryId: string, requirement: BuyerRequirement) => void
  addProperty: (property: Omit<Property, 'id' | 'created_at' | 'updated_at'>) => void
  updateProperty: (id: string, updates: Partial<Property>) => void
  deleteProperty: (id: string) => void
  findMatchingProperties: (requirement: BuyerRequirement) => PropertyWithScore[]
  getStaffName: (staffId: string | null) => string
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Matching algorithm
function calculateMatchScore(property: Property, requirement: BuyerRequirement): number {
  let score = 0

  // 1. Area Match = 30 points
  if (property.area === requirement.area) {
    score += 30
  }

  // 2. Budget Match = 30 points
  if (requirement.budget_min !== null && requirement.budget_max !== null) {
    if (
      property.price_max >= requirement.budget_min &&
      property.price_min <= requirement.budget_max
    ) {
      score += 30
    } else {
      // Partial overlap
      const propertyRange = [property.price_min, property.price_max]
      const budgetRange = [requirement.budget_min, requirement.budget_max]
      const overlap = Math.min(propertyRange[1], budgetRange[1]) - Math.max(propertyRange[0], budgetRange[0])
      if (overlap > 0) {
        score += 15
      }
    }
  }

  // 3. Property Type & BHK = 20 points
  if (property.property_type === requirement.property_type) {
    score += 10

    if (property.property_type === 'Flat' && requirement.property_type === 'Flat') {
      if (property.bhk && requirement.bhk_min !== null && requirement.bhk_max !== null) {
        const propertyBHK = parseInt(property.bhk)
        if (propertyBHK >= requirement.bhk_min && propertyBHK <= requirement.bhk_max) {
          score += 10
        }
      }
    }

    if (property.property_type === 'Plot' && requirement.property_type === 'Plot') {
      score += 10
    }
  }

  // 4. Rent/Buy = 20 points
  if (property.property_for === requirement.property_for) {
    score += 20
  }

  return score
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>(demoEnquiries)
  const [properties, setProperties] = useState<Property[]>(demoProperties)

  const addEnquiry = useCallback((enquiry: Omit<Enquiry, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date()
    const newEnquiry: Enquiry = {
      ...enquiry,
      id: `enq-${Date.now()}`,
      created_at: now,
      updated_at: now,
    }
    setEnquiries((prev) => [newEnquiry, ...prev])
  }, [])

  const updateEnquiry = useCallback((id: string, updates: Partial<Enquiry>) => {
    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, ...updates, updated_at: new Date() } : e
      )
    )
  }, [])

  const deleteEnquiry = useCallback((id: string) => {
    setEnquiries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const updateEnquiryStatus = useCallback((id: string, status: EnquiryStatus) => {
    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status, updated_at: new Date() } : e
      )
    )
  }, [])

  const assignEnquiry = useCallback((id: string, staffId: string | null) => {
    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, assigned_to_staff_id: staffId, updated_at: new Date() } : e
      )
    )
  }, [])

  const saveBuyerRequirement = useCallback((enquiryId: string, requirement: BuyerRequirement) => {
    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === enquiryId ? { ...e, buyer_requirement: requirement, updated_at: new Date() } : e
      )
    )
  }, [])

  const addProperty = useCallback((property: Omit<Property, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date()
    const newProperty: Property = {
      ...property,
      id: `prop-${Date.now()}`,
      created_at: now,
      updated_at: now,
    }
    setProperties((prev) => [newProperty, ...prev])
  }, [])

  const updateProperty = useCallback((id: string, updates: Partial<Property>) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updated_at: new Date() } : p
      )
    )
  }, [])

  const deleteProperty = useCallback((id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const findMatchingProperties = useCallback((requirement: BuyerRequirement): PropertyWithScore[] => {
    return properties
      .filter((p) => p.status === 'Available')
      .map((p) => ({
        ...p,
        score: calculateMatchScore(p, requirement),
      }))
      .filter((p) => p.score >= 60)
      .sort((a, b) => b.score - a.score)
  }, [properties])

  const getStaffName = useCallback((staffId: string | null): string => {
    if (!staffId) return 'Unassigned'
    const staff = demoUsers.find((u) => u.id === staffId)
    return staff?.full_name || 'Unknown'
  }, [])

  return (
    <DataContext.Provider
      value={{
        enquiries,
        properties,
        users: demoUsers,
        addEnquiry,
        updateEnquiry,
        deleteEnquiry,
        updateEnquiryStatus,
        assignEnquiry,
        saveBuyerRequirement,
        addProperty,
        updateProperty,
        deleteProperty,
        findMatchingProperties,
        getStaffName,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
