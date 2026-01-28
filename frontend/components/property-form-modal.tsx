'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useData } from '@/contexts/data-context'
import { useAuth } from '@/contexts/auth-context'
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
import type { Property, Area, PropertyFor, PropertyType, BHKType, PropertyStatus } from '@/lib/types'

interface PropertyFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  property?: Property | null // If provided, we're editing
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

const bhkTypes: BHKType[] = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK']

const propertyStatuses: PropertyStatus[] = ['Available', 'On Hold', 'Sold/Rented']

export function PropertyFormModal({ open, onOpenChange, property }: PropertyFormModalProps) {
  const { addProperty, updateProperty } = useData()
  const { currentUser } = useAuth()
  
  const isEditing = !!property

  const [ownerName, setOwnerName] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [area, setArea] = useState<Area | ''>('')
  const [propertyFor, setPropertyFor] = useState<PropertyFor | ''>('')
  const [propertyType, setPropertyType] = useState<PropertyType | ''>('')
  const [bhk, setBhk] = useState<BHKType | ''>('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [carpetArea, setCarpetArea] = useState('')
  const [status, setStatus] = useState<PropertyStatus>('Available')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  // Pre-fill for editing
  useEffect(() => {
    if (property) {
      setOwnerName(property.owner_name)
      setOwnerPhone(property.owner_phone)
      setArea(property.area)
      setPropertyFor(property.property_for)
      setPropertyType(property.property_type)
      setBhk(property.bhk || '')
      
      // Convert prices for display
      if (property.property_for === 'Buy') {
        // Convert from actual value to lakhs for display
        setPriceMin((property.price_min / 100000).toString())
        setPriceMax((property.price_max / 100000).toString())
      } else {
        // For rent, display as is (in rupees)
        setPriceMin(property.price_min.toString())
        setPriceMax(property.price_max.toString())
      }
      
      setCarpetArea(property.carpet_area?.toString() || '')
      setStatus(property.status)
      setNotes(property.notes || '')
    } else {
      resetForm()
    }
  }, [property])

  const resetForm = () => {
    setOwnerName('')
    setOwnerPhone('')
    setArea('')
    setPropertyFor('')
    setPropertyType('')
    setBhk('')
    setPriceMin('')
    setPriceMax('')
    setCarpetArea('')
    setStatus('Available')
    setNotes('')
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!ownerName.trim()) {
      setError('Owner name is required')
      return
    }
    if (!ownerPhone.trim()) {
      setError('Owner phone is required')
      return
    }
    if (!area) {
      setError('Area is required')
      return
    }
    if (!propertyFor) {
      setError('Property for (Rent/Buy) is required')
      return
    }
    if (!propertyType) {
      setError('Property type is required')
      return
    }
    if (propertyType === 'Flat' && !bhk) {
      setError('BHK is required for Flat')
      return
    }
    if (!priceMin || !priceMax) {
      setError('Price range is required')
      return
    }

    // Convert price based on property type
    let priceMinValue = parseFloat(priceMin)
    let priceMaxValue = parseFloat(priceMax)
    
    if (propertyFor === 'Buy') {
      // Convert lakhs to actual value
      priceMinValue *= 100000
      priceMaxValue *= 100000
    }

    const propertyData = {
      owner_name: ownerName.trim(),
      owner_phone: ownerPhone.startsWith('+91') ? ownerPhone : `+91${ownerPhone.replace(/\D/g, '')}`,
      area: area as Area,
      property_for: propertyFor as PropertyFor,
      property_type: propertyType as PropertyType,
      bhk: propertyType === 'Flat' ? (bhk as BHKType) : null,
      price_min: priceMinValue,
      price_max: priceMaxValue,
      carpet_area: carpetArea ? parseFloat(carpetArea) : null,
      status,
      notes: notes.trim() || null,
      added_by_user_id: currentUser?.id || '',
    }

    if (isEditing && property) {
      updateProperty(property.id, propertyData)
    } else {
      addProperty(propertyData)
    }

    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? 'Edit Property' : 'Add New Property'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base">
              Owner Name <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Enter owner name"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base">
              Owner Phone <span className="text-destructive">*</span>
            </Label>
            <Input
              type="tel"
              placeholder="+91 9876543210"
              value={ownerPhone}
              onChange={(e) => setOwnerPhone(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base">
              Area <span className="text-destructive">*</span>
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
              Property For <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={propertyFor}
              onValueChange={(v) => setPropertyFor(v as PropertyFor)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Rent" id="prop-rent" />
                <Label htmlFor="prop-rent" className="text-base font-normal cursor-pointer">
                  Rent
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Buy" id="prop-buy" />
                <Label htmlFor="prop-buy" className="text-base font-normal cursor-pointer">
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
                  setBhk('')
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
                BHK <span className="text-destructive">*</span>
              </Label>
              <Select value={bhk} onValueChange={(v) => setBhk(v as BHKType)}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select BHK" />
                </SelectTrigger>
                <SelectContent>
                  {bhkTypes.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {propertyType === 'Plot' && (
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              BHK not applicable for plots
            </p>
          )}

          <div className="space-y-2">
            <Label className="text-base">
              Price Range {propertyFor === 'Rent' ? '(in Rupees/month)' : '(in Lakhs)'}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="h-12 text-base"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="h-12 text-base"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base">Carpet Area (sq ft)</Label>
            <Input
              type="number"
              placeholder="Enter carpet area"
              value={carpetArea}
              onChange={(e) => setCarpetArea(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base">
              Status <span className="text-destructive">*</span>
            </Label>
            <Select value={status} onValueChange={(v) => setStatus(v as PropertyStatus)}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {propertyStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 text-base"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 h-12 text-base">
              {isEditing ? 'Update Property' : 'Add Property'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
