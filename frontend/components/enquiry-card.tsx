'use client'

import { useData } from '@/contexts/data-context'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Phone, MessageCircle, Search, Trash2, Plus } from 'lucide-react'
import type { Enquiry, EnquiryStatus } from '@/lib/types'
import { demoUsers } from '@/lib/demo-data'
import { formatDistanceToNow } from '@/lib/date-utils'

interface EnquiryCardProps {
  enquiry: Enquiry
  onCheckProperty: (enquiry: Enquiry) => void
  onAddRequirement?: (enquiry: Enquiry) => void
}

const statusColors: Record<EnquiryStatus, string> = {
  'New Enquiry': 'bg-blue-100 text-blue-800',
  Contacted: 'bg-amber-100 text-amber-800',
  'Appointment Booked': 'bg-indigo-100 text-indigo-800',
  'Not Interested': 'bg-gray-100 text-gray-800',
  'Wrong Number': 'bg-red-100 text-red-800',
  Closed: 'bg-emerald-100 text-emerald-800',
}

const statuses: EnquiryStatus[] = [
  'New Enquiry',
  'Contacted',
  'Appointment Booked',
  'Not Interested',
  'Wrong Number',
  'Closed',
]

export function EnquiryCard({ enquiry, onCheckProperty, onAddRequirement }: EnquiryCardProps) {
  const { updateEnquiryStatus, assignEnquiry, deleteEnquiry, getStaffName } = useData()
  const { isAdmin } = useAuth()

  const staffMembers = demoUsers.filter((u) => u.role === 'staff')
  const canCheckProperty = ['Contacted', 'Appointment Booked', 'Closed'].includes(enquiry.status)

  const handleCall = () => {
    const phone = enquiry.customer_phone.replace(/\s/g, '')
    window.location.href = `tel:${phone}`
  }

  const handleWhatsApp = () => {
    const phone = enquiry.customer_phone.replace(/\s/g, '').replace('+', '')
    window.open(`https://wa.me/${phone}`, '_blank')
  }

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
        {/* Main Content (will grow) */}
        <div className="flex-1">
          {/* Header: Phone & Actions */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-xl font-bold truncate">{enquiry.customer_phone}</p>
              {enquiry.customer_name && (
                <p className="text-base text-muted-foreground truncate">
                  {enquiry.customer_name}
                </p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="icon"
                variant="default"
                className="h-10 w-10"
                onClick={handleCall}
                aria-label="Call"
              >
                <Phone className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                variant="default"
                className="h-10 w-10"
                onClick={handleWhatsApp}
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-2 text-sm mb-3">
            <Badge variant="secondary">{enquiry.lead_source}</Badge>
            <span className="text-muted-foreground">
              {formatDistanceToNow(enquiry.created_at)}
            </span>
          </div>

          {/* Notes */}
          {enquiry.notes && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{enquiry.notes}</p>
          )}

          {/* Buyer Requirement Badge */}
          {enquiry.buyer_requirement && (
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                ✓ Requirements saved
              </Badge>
            </div>
          )}

          {/* Status Dropdown */}
          <div className="space-y-2 mb-3">
            <label className="text-sm text-muted-foreground">Status</label>
            <Select
              value={enquiry.status}
              onValueChange={(value) => updateEnquiryStatus(enquiry.id, value as EnquiryStatus)}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    <span className={`px-2 py-0.5 rounded text-xs ${statusColors[status]}`}>
                      {status}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignment (Admin Only) */}
          {isAdmin && (
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Assigned To</label>
              <Select
                value={enquiry.assigned_to_staff_id || 'unassigned'}
                onValueChange={(value) =>
                  assignEnquiry(enquiry.id, value === 'unassigned' ? null : value)
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {staffMembers.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Staff view: show who it's assigned to */}
          {!isAdmin && enquiry.assigned_to_staff_id && (
            <p className="text-sm text-muted-foreground">
              Assigned to: {getStaffName(enquiry.assigned_to_staff_id)}
            </p>
          )}
        </div>

        {/* Actions (always at bottom) */}
        <div className="flex flex-col gap-2 pt-4 border-t mt-2">
          {/* When requirement is saved: Show Add & Check buttons */}
          {isAdmin && enquiry.buyer_requirement && onAddRequirement && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-11 bg-transparent"
                onClick={() => onAddRequirement(enquiry)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Requirement
              </Button>
              <Button
                variant="default"
                className="h-11"
                onClick={() => onAddRequirement(enquiry)}
              >
                <Search className="w-4 h-4 mr-2" />
                Check Availability
              </Button>
            </div>
          )}

          {/* When no requirement saved: Show Add Requirement */}
          {isAdmin && !enquiry.buyer_requirement && onAddRequirement && (
            <Button
              variant="default"
              className="w-full h-11"
              onClick={() => onAddRequirement(enquiry)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Requirement
            </Button>
          )}

          <div className="flex gap-2">
            {canCheckProperty && (
              <Button
                variant="outline"
                className="flex-1 h-11 bg-transparent"
                onClick={() => onCheckProperty(enquiry)}
              >
                <Search className="w-4 h-4 mr-2" />
                Check Property
              </Button>
            )}
            {isAdmin && (
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                onClick={() => deleteEnquiry(enquiry.id)}
                aria-label="Delete enquiry"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
