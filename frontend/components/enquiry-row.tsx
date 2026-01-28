'use client'

import { useData } from '@/contexts/data-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Phone, MessageCircle } from 'lucide-react'
import type { Enquiry, EnquiryStatus } from '@/lib/types'
import { formatDistanceToNow } from '@/lib/date-utils'

interface EnquiryRowProps {
  enquiry: Enquiry
}

const statusColors: Record<EnquiryStatus, string> = {
  'New Enquiry': 'bg-blue-100 text-blue-800',
  Contacted: 'bg-amber-100 text-amber-800',
  'Appointment Booked': 'bg-indigo-100 text-indigo-800',
  'Not Interested': 'bg-gray-100 text-gray-800',
  'Wrong Number': 'bg-red-100 text-red-800',
  Closed: 'bg-emerald-100 text-emerald-800',
}

export function EnquiryRow({ enquiry }: EnquiryRowProps) {
  const { getStaffName } = useData()

  const handleCall = () => {
    const phone = enquiry.customer_phone.replace(/\s/g, '')
    window.location.href = `tel:${phone}`
  }

  const handleWhatsApp = () => {
    const phone = enquiry.customer_phone.replace(/\s/g, '').replace('+', '')
    window.open(`https://wa.me/${phone}`, '_blank')
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold truncate">{enquiry.customer_phone}</p>
          {enquiry.customer_name && (
            <span className="text-sm text-muted-foreground">({enquiry.customer_name})</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge className={statusColors[enquiry.status]} variant="secondary">
            {enquiry.status}
          </Badge>
          <Badge variant="outline">{enquiry.lead_source}</Badge>
          {enquiry.assigned_to_staff_id && (
            <span className="text-xs text-muted-foreground">
              Assigned: {getStaffName(enquiry.assigned_to_staff_id)}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(enquiry.created_at)}
          </span>
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
          onClick={handleCall}
          aria-label="Call"
        >
          <Phone className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
          onClick={handleWhatsApp}
          aria-label="WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
