'use client'

import { useMemo, useState } from 'react'
import { useData } from '@/contexts/data-context'
import { useAuth } from '@/contexts/auth-context'
import { StatCard } from '@/components/stat-card'
import { EnquiryRow } from '@/components/enquiry-row'
import { Button } from '@/components/ui/button'
import { UserCheck, Phone, CheckCircle, X } from 'lucide-react'

type StatFilter = 'assigned' | 'contacted' | 'closed' | null

export function StaffDashboard() {
  const { enquiries } = useData()
  const { currentUser } = useAuth()
  const [activeFilter, setActiveFilter] = useState<StatFilter>(null)

  const myEnquiries = useMemo(() => {
    return enquiries.filter((e) => e.assigned_to_staff_id === currentUser?.id)
  }, [enquiries, currentUser?.id])

  const stats = useMemo(() => {
    const assigned = myEnquiries.length

    // Contacted today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const contactedToday = myEnquiries.filter((e) => {
      const updated = new Date(e.updated_at)
      return e.status === 'Contacted' && updated >= today
    }).length

    // Closed this week
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const closedThisWeek = myEnquiries.filter((e) => {
      const updated = new Date(e.updated_at)
      return e.status === 'Closed' && updated >= weekAgo
    }).length

    return { assigned, contactedToday, closedThisWeek }
  }, [myEnquiries])

  const filteredEnquiries = useMemo(() => {
    if (!activeFilter) return []

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    switch (activeFilter) {
      case 'assigned':
        return myEnquiries
      case 'contacted':
        return myEnquiries.filter((e) => {
          const updated = new Date(e.updated_at)
          return e.status === 'Contacted' && updated >= today
        })
      case 'closed':
        return myEnquiries.filter((e) => {
          const updated = new Date(e.updated_at)
          return e.status === 'Closed' && updated >= weekAgo
        })
      default:
        return []
    }
  }, [myEnquiries, activeFilter])

  const handleStatClick = (filter: StatFilter) => {
    setActiveFilter(activeFilter === filter ? null : filter)
  }

  const filterTitles: Record<NonNullable<StatFilter>, string> = {
    assigned: 'My Assigned Enquiries',
    contacted: 'Contacted Today',
    closed: 'Closed This Week',
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {currentUser?.full_name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Assigned to Me"
          value={stats.assigned}
          icon={UserCheck}
          variant="primary"
          isActive={activeFilter === 'assigned'}
          onClick={() => handleStatClick('assigned')}
        />
        <StatCard
          title="Contacted Today"
          value={stats.contactedToday}
          icon={Phone}
          variant="default"
          isActive={activeFilter === 'contacted'}
          onClick={() => handleStatClick('contacted')}
        />
        <StatCard
          title="Closed This Week"
          value={stats.closedThisWeek}
          icon={CheckCircle}
          variant="success"
          isActive={activeFilter === 'closed'}
          onClick={() => handleStatClick('closed')}
        />
      </div>

      {/* Expandable Detail Section */}
      {activeFilter && (
        <div className="bg-muted/30 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold">{filterTitles[activeFilter]} ({filteredEnquiries.length})</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setActiveFilter(null)}
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
            {filteredEnquiries.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No enquiries found</p>
            ) : (
              filteredEnquiries.map((enquiry) => (
                <EnquiryRow key={enquiry.id} enquiry={enquiry} />
              ))
            )}
          </div>
        </div>
      )}

      {!activeFilter && (
        <div className="bg-muted/30 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium mb-2">Your Tasks</h3>
          <p className="text-muted-foreground">
            Click on any stat card above to view details. Navigate to Buyers to view and manage your assigned enquiries.
          </p>
        </div>
      )}
    </div>
  )
}
