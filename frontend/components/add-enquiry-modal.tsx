'use client'

import React from "react"

import { useState } from 'react'
import { useData } from '@/contexts/data-context'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { LeadSource } from '@/lib/types'
import { demoUsers } from '@/lib/demo-data'

interface AddEnquiryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const leadSources: LeadSource[] = [
  'Ads Campaign',
  'Website Form',
  'Manual Entry',
  'Phone Call',
  'Referral',
  'Walk-in',
]

export function AddEnquiryModal({ open, onOpenChange }: AddEnquiryModalProps) {
  const { addEnquiry } = useData()
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [leadSource, setLeadSource] = useState<LeadSource | ''>('')
  const [notes, setNotes] = useState('')
  const [assignTo, setAssignTo] = useState<string>('unassigned')
  const [error, setError] = useState('')

  const staffMembers = demoUsers.filter((u) => u.role === 'staff')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!phone.trim()) {
      setError('Phone number is required')
      return
    }
    if (!leadSource) {
      setError('Lead source is required')
      return
    }

    addEnquiry({
      customer_phone: phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '')}`,
      customer_name: name.trim() || null,
      lead_source: leadSource,
      status: 'New Enquiry',
      assigned_to_staff_id: assignTo === 'unassigned' ? null : assignTo,
      notes: notes.trim() || null,
      buyer_requirement: null,
    })

    // Reset and close
    setPhone('')
    setName('')
    setLeadSource('')
    setNotes('')
    setAssignTo('unassigned')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Enquiry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">
              Customer Name
            </Label>
            <Input
              id="name"
              placeholder="Enter customer name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadSource" className="text-base">
              Lead Source <span className="text-destructive">*</span>
            </Label>
            <Select value={leadSource} onValueChange={(v) => setLeadSource(v as LeadSource)}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select lead source" />
              </SelectTrigger>
              <SelectContent>
                {leadSources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignTo" className="text-base">
              Assign To
            </Label>
            <Select value={assignTo} onValueChange={setAssignTo}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Leave unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Leave Unassigned</SelectItem>
                {staffMembers.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 text-base"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 h-12 text-base">
              Add Enquiry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
