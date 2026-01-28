'use client'

import { useState, useMemo } from 'react'
import { useData } from '@/contexts/data-context'
import { useAuth } from '@/contexts/auth-context'
import { EnquiryCard } from '@/components/enquiry-card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'
import type { Enquiry, EnquiryStatus } from '@/lib/types'

type FilterOption = 'all' | 'unassigned' | 'assigned' | EnquiryStatus

interface BuyersPageProps {
  onCheckProperty: (enquiry: Enquiry) => void
  onAddRequirement: (enquiry: Enquiry) => void
}

export function BuyersPage({ onCheckProperty, onAddRequirement }: BuyersPageProps) {
  const { enquiries } = useData()
  const { isAdmin, currentUser } = useAuth()
  const [filter, setFilter] = useState<FilterOption>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEnquiries = useMemo(() => {
    let result = enquiries

    // Staff only sees their assigned enquiries
    if (!isAdmin) {
      result = result.filter((e) => e.assigned_to_staff_id === currentUser?.id)
    }

    // Apply filter
    if (filter === 'unassigned') {
      result = result.filter((e) => !e.assigned_to_staff_id)
    } else if (filter === 'assigned') {
      result = result.filter((e) => e.assigned_to_staff_id)
    } else if (filter !== 'all') {
      result = result.filter((e) => e.status === filter)
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (e) =>
          e.customer_phone.toLowerCase().includes(query) ||
          e.customer_name?.toLowerCase().includes(query)
      )
    }

    // Sort by created_at descending
    return result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [enquiries, isAdmin, currentUser?.id, filter, searchQuery])

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Buyers</h1>
        <p className="text-muted-foreground">
          {isAdmin ? 'Manage all buyer enquiries' : 'Your assigned enquiries'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by phone or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as FilterOption)}>
          <SelectTrigger className="w-full sm:w-48 h-11">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Enquiries</SelectItem>
            {isAdmin && (
              <>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
              </>
            )}
            <SelectItem value="New Enquiry">New Enquiry</SelectItem>
            <SelectItem value="Contacted">Contacted</SelectItem>
            <SelectItem value="Appointment Booked">Appointment Booked</SelectItem>
            <SelectItem value="Not Interested">Not Interested</SelectItem>
            <SelectItem value="Wrong Number">Wrong Number</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredEnquiries.length} enquir{filteredEnquiries.length === 1 ? 'y' : 'ies'}
      </p>

      {/* Enquiry List */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredEnquiries.map((enquiry) => (
          <EnquiryCard
            key={enquiry.id}
            enquiry={enquiry}
            onCheckProperty={onCheckProperty}
            onAddRequirement={onAddRequirement}
          />
        ))}
      </div>

      {filteredEnquiries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No enquiries found</p>
        </div>
      )}
    </div>
  )
}
