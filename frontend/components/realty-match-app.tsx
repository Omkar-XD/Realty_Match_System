'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { LoginPage } from '@/components/login-page'
import { AppLayout } from '@/components/app-layout'
import { AdminDashboard } from '@/components/admin-dashboard'
import { StaffDashboard } from '@/components/staff-dashboard'
import { BuyersPage } from '@/components/buyers-page'
import { OwnersPage } from '@/components/owners-page'
import { AddEnquiryModal } from '@/components/add-enquiry-modal'
import { CheckPropertyModal } from '@/components/check-property-modal'
import { PropertyFormModal } from '@/components/property-form-modal'
import { AddRequirementModal } from '@/components/add-requirement-modal'
import type { Enquiry, Property } from '@/lib/types'

type Tab = 'dashboard' | 'buyers' | 'owners'

export function RealtyMatchApp() {
  const { currentUser, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  
  // Modal states
  const [showAddEnquiry, setShowAddEnquiry] = useState(false)
  const [showCheckProperty, setShowCheckProperty] = useState(false)
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
  const [checkPropertyMode, setCheckPropertyMode] = useState<'add' | 'check'>('add')
  const [showPropertyForm, setShowPropertyForm] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [showAddRequirement, setShowAddRequirement] = useState(false)
  const [requirementEnquiry, setRequirementEnquiry] = useState<Enquiry | null>(null)

  // If not logged in, show login page
  if (!currentUser) {
    return <LoginPage />
  }

  const handleCheckProperty = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry)
    setCheckPropertyMode('add')
    setShowCheckProperty(true)
  }

  const handleAddRequirement = (enquiry: Enquiry) => {
    // Determine mode: 'add' for new requirement, 'check' for existing
    const mode = enquiry.buyer_requirement ? 'check' : 'add'
    setSelectedEnquiry(enquiry)
    setCheckPropertyMode(mode)
    setShowCheckProperty(true)
  }

  const handleAddProperty = () => {
    setSelectedProperty(null)
    setShowPropertyForm(true)
  }

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property)
    setShowPropertyForm(true)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return isAdmin ? (
          <AdminDashboard onAddEnquiry={() => setShowAddEnquiry(true)} />
        ) : (
          <StaffDashboard />
        )
      case 'buyers':
        return (
          <BuyersPage
            onCheckProperty={handleCheckProperty}
            onAddRequirement={handleAddRequirement}
          />
        )
      case 'owners':
        return (
          <OwnersPage
            onAddProperty={handleAddProperty}
            onEditProperty={handleEditProperty}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      <AppLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </AppLayout>

      {/* Modals */}
      <AddEnquiryModal open={showAddEnquiry} onOpenChange={setShowAddEnquiry} />
      
      <CheckPropertyModal
        open={showCheckProperty}
        onOpenChange={setShowCheckProperty}
        enquiry={selectedEnquiry}
        mode={checkPropertyMode}
      />
      
      <PropertyFormModal
        open={showPropertyForm}
        onOpenChange={setShowPropertyForm}
        property={selectedProperty}
      />

      <AddRequirementModal
        open={showAddRequirement}
        onOpenChange={setShowAddRequirement}
        enquiry={requirementEnquiry}
      />
    </>
  )
}
