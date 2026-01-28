'use client'

import React from "react"

import { useState, useEffect } from 'react'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { Enquiry, Area, PropertyFor, PropertyType, BuyerRequirement, PropertyWithScore } from '@/lib/types'
import { MatchingResultsModal } from '@/components/matching-results-modal'
import { Edit } from 'lucide-react'

interface CheckPropertyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enquiry: Enquiry | null
  mode?: 'add' | 'check' // 'add' for new requirement, 'check' for viewing existing
}

const areas: Area[] = [
  'Dharampeth',
  'Sitabuldi',
  'Ramdaspeth',
  'Civil Lines',
  'Sadar',
  'Bajaj Nagar',
  'Manish Nagar',
]

const bhkOptions = [1, 2, 3, 4, 5]

export function CheckPropertyModal({ open, onOpenChange, enquiry, mode = 'add' }: CheckPropertyModalProps) {
  const { saveBuyerRequirement, findMatchingProperties } = useData()
  
  const [area, setArea] = useState<Area | ''>('')
  const [propertyFor, setPropertyFor] = useState<PropertyFor | ''>('')
  const [propertyType, setPropertyType] = useState<PropertyType | ''>('')
  const [bhkMin, setBhkMin] = useState<number | null>(null)
  const [bhkMax, setBhkMax] = useState<number | null>(null)
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [carpetAreaMin, setCarpetAreaMin] = useState('')
  const [carpetAreaMax, setCarpetAreaMax] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(mode === 'add' && !enquiry?.buyer_requirement)
  
  const [showResults, setShowResults] = useState(false)
  const [matchingResults, setMatchingResults] = useState<PropertyWithScore[]>([])

  // Pre-fill if buyer requirement exists
  useEffect(() => {
    if (enquiry?.buyer_requirement) {
      const req = enquiry.buyer_requirement
      setArea(req.area || '')
      setPropertyFor(req.property_for || '')
      setPropertyType(req.property_type || '')
      setBhkMin(req.bhk_min)
      setBhkMax(req.bhk_max)
      // Convert from raw value to display value (divide by 100000 for lakhs, or keep as is for rupees)
      if (req.property_for === 'Rent') {
        setBudgetMin(req.budget_min?.toString() || '')
        setBudgetMax(req.budget_max?.toString() || '')
      } else {
        setBudgetMin(req.budget_min ? (req.budget_min / 100000).toString() : '')
        setBudgetMax(req.budget_max ? (req.budget_max / 100000).toString() : '')
      }
      setCarpetAreaMin(req.carpet_area_min?.toString() || '')
      setCarpetAreaMax(req.carpet_area_max?.toString() || '')
      setNotes(req.notes || '')
      // Show summary view when checking availability, edit view when adding new requirement
      setIsEditing(mode === 'add')
    } else {
      resetForm()
      setIsEditing(true)
    }
  }, [enquiry, mode])

  const resetForm = () => {
    setArea('')
    setPropertyFor('')
    setPropertyType('')
    setBhkMin(null)
    setBhkMax(null)
    setBudgetMin('')
    setBudgetMax('')
    setCarpetAreaMin('')
    setCarpetAreaMax('')
    setNotes('')
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!area) {
      setError('Area preference is required')
      return
    }
    if (!propertyFor) {
      setError('Looking for (Rent/Buy) is required')
      return
    }
    if (!propertyType) {
      setError('Property type is required')
      return
    }
    if (propertyType === 'Flat' && (bhkMin === null || bhkMax === null)) {
      setError('BHK range is required for Flat')
      return
    }
    if (!budgetMin || !budgetMax) {
      setError('Budget range is required')
      return
    }

    // Convert budget based on property type
    let budgetMinValue = parseFloat(budgetMin)
    let budgetMaxValue = parseFloat(budgetMax)
    
    if (propertyFor === 'Buy') {
      // Convert lakhs to actual value (multiply by 100000)
      budgetMinValue *= 100000
      budgetMaxValue *= 100000
    }

    const requirement: BuyerRequirement = {
      area: area as Area,
      property_for: propertyFor as PropertyFor,
      property_type: propertyType as PropertyType,
      bhk_min: propertyType === 'Flat' ? bhkMin : null,
      bhk_max: propertyType === 'Flat' ? bhkMax : null,
      budget_min: budgetMinValue,
      budget_max: budgetMaxValue,
      carpet_area_min: carpetAreaMin ? parseFloat(carpetAreaMin) : null,
      carpet_area_max: carpetAreaMax ? parseFloat(carpetAreaMax) : null,
      notes: notes.trim() || null,
    }

    // Save requirement
    if (enquiry) {
      saveBuyerRequirement(enquiry.id, requirement)
    }

    // Find matches
    const matches = findMatchingProperties(requirement)
    setMatchingResults(matches)
    setShowResults(true)
    setIsEditing(false)
  }

  const handleCloseResults = () => {
    setShowResults(false)
    // Don't reset form - keep showing summary view if requirement exists
    // Form will be reset only when modal is closed from outside
  }

  const handleModalClose = (open: boolean) => {
    if (!open) {
      resetForm()
      setIsEditing(false)
    }
    onOpenChange(open)
  }

  if (showResults) {
    return (
      <MatchingResultsModal
        open={showResults}
        onOpenChange={handleCloseResults}
        results={matchingResults}
      />
    )
  }

  // If requirement exists and not editing, show summary with edit button
  if (enquiry?.buyer_requirement && !isEditing) {
    return (
      <Dialog open={open} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Buyer Requirements</DialogTitle>
            <p className="text-muted-foreground">
              For: {enquiry.customer_name} ({enquiry.customer_phone})
            </p>
          </DialogHeader>
          <div className="space-y-4">
            {/* Saved indicator */}
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-green-700 font-medium">Requirements saved</span>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground text-xs">Area</p>
                    <p className="font-semibold">{enquiry.buyer_requirement.area}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Type</p>
                    <p className="font-semibold">{enquiry.buyer_requirement.property_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Looking For</p>
                    <p className="font-semibold">{enquiry.buyer_requirement.property_for}</p>
                  </div>
                  {enquiry.buyer_requirement.bhk_min !== null && enquiry.buyer_requirement.bhk_max !== null && (
                    <div>
                      <p className="text-muted-foreground text-xs">BHK Range</p>
                      <p className="font-semibold">{enquiry.buyer_requirement.bhk_min} - {enquiry.buyer_requirement.bhk_max}</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Budget Range</p>
                  <p className="font-semibold">
                    {enquiry.buyer_requirement.property_for === 'Rent'
                      ? `₹${enquiry.buyer_requirement.budget_min?.toLocaleString()} - ₹${enquiry.buyer_requirement.budget_max?.toLocaleString()}`
                      : `₹${(enquiry.buyer_requirement.budget_min ? enquiry.buyer_requirement.budget_min / 100000 : 0).toFixed(2)}L - ₹${(enquiry.buyer_requirement.budget_max ? enquiry.buyer_requirement.budget_max / 100000 : 0).toFixed(2)}L`
                    }
                  </p>
                </div>
                {(enquiry.buyer_requirement.carpet_area_min || enquiry.buyer_requirement.carpet_area_max) && (
                  <div>
                    <p className="text-muted-foreground text-xs">Carpet Area (sq ft)</p>
                    <p className="font-semibold">
                      {enquiry.buyer_requirement.carpet_area_min || 0} - {enquiry.buyer_requirement.carpet_area_max || 0}
                    </p>
                  </div>
                )}
              </div>
              {enquiry.buyer_requirement.notes && (
                <div className="pt-2 border-t">
                  <p className="text-muted-foreground text-xs mb-1">Notes</p>
                  <p className="text-sm">{enquiry.buyer_requirement.notes}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Requirements
              </Button>
              <Button
                onClick={() => {
                  const matches = findMatchingProperties(enquiry.buyer_requirement!)
                  setMatchingResults(matches)
                  setShowResults(true)
                }}
                className="flex-1"
              >
                Check Availability
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing && enquiry?.buyer_requirement ? 'Edit Requirements' : 'Check Property'}
          </DialogTitle>
          {enquiry?.customer_name && (
            <p className="text-muted-foreground">
              For: {enquiry.customer_name} ({enquiry.customer_phone})
            </p>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base">
              Area Preference <span className="text-destructive">*</span>
            </Label>
            <Select value={area} onValueChange={(v) => setArea(v as Area)}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-base">
              Looking For <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={propertyFor}
              onValueChange={(v) => setPropertyFor(v as PropertyFor)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Rent" id="rent" />
                <Label htmlFor="rent" className="text-base font-normal cursor-pointer">
                  Rent
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Buy" id="buy" />
                <Label htmlFor="buy" className="text-base font-normal cursor-pointer">
                  Buy
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-base">
              Property Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={propertyType}
              onValueChange={(v) => {
                setPropertyType(v as PropertyType)
                if (v === 'Plot') {
                  setBhkMin(null)
                  setBhkMax(null)
                }
              }}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Flat">Flat</SelectItem>
                <SelectItem value="Plot">Plot</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {propertyType === 'Flat' && (
            <div className="space-y-2">
              <Label className="text-base">
                BHK Range <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2 items-center">
                <Select
                  value={bhkMin?.toString() || ''}
                  onValueChange={(v) => setBhkMin(parseInt(v))}
                >
                  <SelectTrigger className="h-12 text-base flex-1">
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent>
                    {bhkOptions.map((b) => (
                      <SelectItem key={b} value={b.toString()}>
                        {b} BHK
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground">to</span>
                <Select
                  value={bhkMax?.toString() || ''}
                  onValueChange={(v) => setBhkMax(parseInt(v))}
                >
                  <SelectTrigger className="h-12 text-base flex-1">
                    <SelectValue placeholder="Max" />
                  </SelectTrigger>
                  <SelectContent>
                    {bhkOptions.map((b) => (
                      <SelectItem key={b} value={b.toString()}>
                        {b} BHK
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {propertyType === 'Plot' && (
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              BHK not applicable for plots
            </p>
          )}

          <div className="space-y-2">
            <Label className="text-base">
              Budget Range {propertyFor === 'Rent' ? '(in Rupees)' : '(in Lakhs)'} <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Min"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                className="h-12 text-base"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="h-12 text-base"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base">Preferred Carpet Area (sq ft)</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Min"
                value={carpetAreaMin}
                onChange={(e) => setCarpetAreaMin(e.target.value)}
                className="h-12 text-base"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={carpetAreaMax}
                onChange={(e) => setCarpetAreaMax(e.target.value)}
                className="h-12 text-base"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base">Notes</Label>
            <Textarea
              placeholder="Any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] text-base"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (isEditing && enquiry?.buyer_requirement) {
                  setIsEditing(false)
                } else {
                  onOpenChange(false)
                }
              }}
              className="flex-1 h-12 text-base"
            >
              {isEditing && enquiry?.buyer_requirement ? 'Cancel' : 'Close'}
            </Button>
            <Button type="submit" className="flex-1 h-12 text-base">
              {isEditing && enquiry?.buyer_requirement ? 'Update & Find Matches' : 'Find Matches'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
