'use client'

import { useMemo, useState } from 'react'
import { useData } from '@/contexts/data-context'
import { StatCard } from '@/components/stat-card'
import { EnquiryRow } from '@/components/enquiry-row'
import { Button } from '@/components/ui/button'
import { ClipboardList, UserX, UserCheck, CheckCircle, Plus, X } from 'lucide-react'

interface AdminDashboardProps {
  onAddEnquiry: () => void
}

type StatFilter = 'total' | 'unassigned' | 'assigned' | 'closed' | null

export function AdminDashboard({ onAddEnquiry }: AdminDashboardProps) {
  const { enquiries } = useData()
  const [activeFilter, setActiveFilter] = useState<StatFilter>(null)

  const stats = useMemo(() => {
    const total = enquiries.length
    const unassigned = enquiries.filter((e) => !e.assigned_to_staff_id).length
    const assigned = enquiries.filter((e) => e.assigned_to_staff_id).length
    const closed = enquiries.filter((e) => e.status === 'Closed').length

    return { total, unassigned, assigned, closed }
  }, [enquiries])

  const filteredEnquiries = useMemo(() => {
    if (!activeFilter) return []
    
    switch (activeFilter) {
      case 'total':
        return enquiries
      case 'unassigned':
        return enquiries.filter((e) => !e.assigned_to_staff_id)
      case 'assigned':
        return enquiries.filter((e) => e.assigned_to_staff_id)
      case 'closed':
        return enquiries.filter((e) => e.status === 'Closed')
      default:
        return []
    }
  }, [enquiries, activeFilter])

  const handleStatClick = (filter: StatFilter) => {
    setActiveFilter(activeFilter === filter ? null : filter)
  }

  const filterTitles: Record<NonNullable<StatFilter>, string> = {
    total: 'All Enquiries',
    unassigned: 'Unassigned Enquiries',
    assigned: 'Assigned Enquiries',
    closed: 'Closed Enquiries',
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Admin</p>
        </div>
        <Button onClick={onAddEnquiry} className="h-12 px-6">
          <Plus className="w-5 h-5 mr-2" />
          Add Enquiry
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Enquiries"
          value={stats.total}
          icon={ClipboardList}
          variant="primary"
          isActive={activeFilter === 'total'}
          onClick={() => handleStatClick('total')}
        />
        <StatCard
          title="Unassigned"
          value={stats.unassigned}
          icon={UserX}
          variant="warning"
          isActive={activeFilter === 'unassigned'}
          onClick={() => handleStatClick('unassigned')}
        />
        <StatCard
          title="Assigned"
          value={stats.assigned}
          icon={UserCheck}
          variant="default"
          isActive={activeFilter === 'assigned'}
          onClick={() => handleStatClick('assigned')}
        />
        <StatCard
          title="Closed"
          value={stats.closed}
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
          <h3 className="text-lg font-medium mb-2">Quick Actions</h3>
          <p className="text-muted-foreground mb-4">
            Click on any stat card above to view details, or use the bottom navigation to manage Buyers and Property Owners
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={onAddEnquiry} className="bg-transparent">
              <Plus className="w-4 h-4 mr-2" />
              New Enquiry
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
