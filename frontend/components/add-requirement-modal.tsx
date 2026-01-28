'use client'

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
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Phone, MessageCircle, Search, X, MapPin, Home, IndianRupee, Maximize } from 'lucide-react'
import type { Enquiry, BuyerRequirement, Area, PropertyFor, PropertyType, PropertyWithScore } from '@/lib/types'

const areas: Area[] = [
  'Dharampeth',
  'Sitabuldi',
  'Ramdaspeth',
  'Civil Lines',
  'Sadar',
  'Bajaj Nagar',
  'Manish Nagar',
]

const propertyFor: PropertyFor[] = ['Rent', 'Buy']
const propertyTypes: PropertyType[] = ['Flat', 'Plot']

interface AddRequirementModalProps {
  enquiry: Enquiry | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddRequirementModal({ enquiry, open, onOpenChange }: AddRequirementModalProps) {
  const { saveBuyerRequirement, findMatchingProperties } = useData()
  
  const [area, setArea] = useState<Area | ''>('')
  const [propFor, setPropFor] = useState<PropertyFor | ''>('')
  const [propType, setPropType] = useState<PropertyType | ''>('')
  const [bhkMin, setBhkMin] = useState('')
  const [bhkMax, setBhkMax] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [carpetMin, setCarpetMin] = useState('')
  const [carpetMax, setCarpetMax] = useState('')
  const [notes, setNotes] = useState('')
  
  const [saved, setSaved] = useState(false)
  const [showMatches, setShowMatches] = useState(false)
  const [matchingProperties, setMatchingProperties] = useState<PropertyWithScore[]>([])

  const resetForm = () => {
    setArea('')
    setPropFor('')
    setPropType('')
    setBhkMin('')
    setBhkMax('')
    setBudgetMin('')
    setBudgetMax('')
    setCarpetMin('')
    setCarpetMax('')
    setNotes('')
    setSaved(false)
    setShowMatches(false)
    setMatchingProperties([])
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  const handleSave = () => {
    if (!enquiry) return

    let budgetMinValue = budgetMin ? parseFloat(budgetMin) : null
    let budgetMaxValue = budgetMax ? parseFloat(budgetMax) : null
    
    // Convert budget based on property type
    if (propFor === 'Buy') {
      // Convert lakhs to actual value
      budgetMinValue = budgetMinValue ? budgetMinValue * 100000 : null
      budgetMaxValue = budgetMaxValue ? budgetMaxValue * 100000 : null
    }

    const requirement: BuyerRequirement = {
      area: area || null,
      property_for: propFor || null,
      property_type: propType || null,
      bhk_min: bhkMin ? parseInt(bhkMin) : null,
      bhk_max: bhkMax ? parseInt(bhkMax) : null,
      budget_min: budgetMinValue,
      budget_max: budgetMaxValue,
      carpet_area_min: carpetMin ? parseInt(carpetMin) : null,
      carpet_area_max: carpetMax ? parseInt(carpetMax) : null,
      notes: notes || null,
    }

    saveBuyerRequirement(enquiry.id, requirement)
    setSaved(true)
  }

  const handleCheckAvailability = () => {
    let budgetMinValue = budgetMin ? parseFloat(budgetMin) : null
    let budgetMaxValue = budgetMax ? parseFloat(budgetMax) : null
    
    // Convert budget based on property type
    if (propFor === 'Buy') {
      // Convert lakhs to actual value
      budgetMinValue = budgetMinValue ? budgetMinValue * 100000 : null
      budgetMaxValue = budgetMaxValue ? budgetMaxValue * 100000 : null
    }

    const requirement: BuyerRequirement = {
      area: area || null,
      property_for: propFor || null,
      property_type: propType || null,
      bhk_min: bhkMin ? parseInt(bhkMin) : null,
      bhk_max: bhkMax ? parseInt(bhkMax) : null,
      budget_min: budgetMinValue,
      budget_max: budgetMaxValue,
      carpet_area_min: carpetMin ? parseInt(carpetMin) : null,
      carpet_area_max: carpetMax ? parseInt(carpetMax) : null,
      notes: notes || null,
    }

    const matches = findMatchingProperties(requirement)
    setMatchingProperties(matches)
    setShowMatches(true)
  }

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `${(price / 10000000).toFixed(2)} Cr`
    }
    return `${(price / 100000).toFixed(2)} L`
  }

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s/g, '')}`
  }

  const handleWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/\s/g, '').replace('+', '')}`, '_blank')
  }

  if (!enquiry) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {showMatches ? 'Matching Properties' : 'Add Buyer Requirement'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {enquiry.customer_phone} {enquiry.customer_name && `- ${enquiry.customer_name}`}
          </p>
        </DialogHeader>

        {showMatches ? (
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setShowMatches(false)}
              className="mb-2"
            >
              Back to Requirements
            </Button>

            {matchingProperties.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No matching properties found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting the requirements
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Found {matchingProperties.length} matching properties
                </p>
                {matchingProperties.map((property) => (
                  <Card key={property.id} className="overflow-hidden">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{property.owner_name}</p>
                          <p className="text-sm text-muted-foreground">{property.owner_phone}</p>
                        </div>
                        <Badge className="bg-primary/10 text-primary">
                          {property.score}% Match
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{property.area}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Home className="w-4 h-4 text-muted-foreground" />
                          <span>{property.property_type} {property.bhk && `- ${property.bhk}`}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <IndianRupee className="w-4 h-4 text-muted-foreground" />
                          <span>{formatPrice(property.price_min)} - {formatPrice(property.price_max)}</span>
                        </div>
                        {property.carpet_area && (
                          <div className="flex items-center gap-1.5">
                            <Maximize className="w-4 h-4 text-muted-foreground" />
                            <span>{property.carpet_area} sq ft</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{property.property_for}</Badge>
                        <Badge
                          variant="outline"
                          className={
                            property.status === 'Available'
                              ? 'bg-primary/10 text-primary border-primary/30'
                              : property.status === 'On Hold'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-muted text-muted-foreground'
                          }
                        >
                          {property.status}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleCall(property.owner_phone)}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Call Owner
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => handleWhatsApp(property.owner_phone)}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          WhatsApp
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Area */}
            <div className="space-y-2">
              <Label className="text-sm">Area / Location</Label>
              <Select value={area} onValueChange={(v) => setArea(v as Area)}>
                <SelectTrigger className="h-11">
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

            {/* Property For */}
            <div className="space-y-2">
              <Label className="text-sm">Looking to</Label>
              <Select value={propFor} onValueChange={(v) => setPropFor(v as PropertyFor)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Rent or Buy" />
                </SelectTrigger>
                <SelectContent>
                  {propertyFor.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Property Type */}
            <div className="space-y-2">
              <Label className="text-sm">Property Type</Label>
              <Select value={propType} onValueChange={(v) => setPropType(v as PropertyType)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* BHK Range (only for Flat) */}
            {propType === 'Flat' && (
              <div className="space-y-2">
                <Label className="text-sm">BHK Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min BHK"
                    value={bhkMin}
                    onChange={(e) => setBhkMin(e.target.value)}
                    min="1"
                    max="5"
                    className="h-11"
                  />
                  <Input
                    type="number"
                    placeholder="Max BHK"
                    value={bhkMax}
                    onChange={(e) => setBhkMax(e.target.value)}
                    min="1"
                    max="5"
                    className="h-11"
                  />
                </div>
              </div>
            )}

            {/* Budget Range */}
            <div className="space-y-2">
              <Label className="text-sm">Budget Range {propFor === 'Rent' ? '(in Rupees)' : '(in Lakhs)'}</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  className="h-11"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            {/* Carpet Area */}
            <div className="space-y-2">
              <Label className="text-sm">Carpet Area (sq ft)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={carpetMin}
                  onChange={(e) => setCarpetMin(e.target.value)}
                  className="h-11"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={carpetMax}
                  onChange={(e) => setCarpetMax(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-sm">Additional Notes</Label>
              <Textarea
                placeholder="Any specific requirements..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {!saved ? (
                <Button onClick={handleSave} className="flex-1 h-11">
                  Save Requirement
                </Button>
              ) : (
                <Button
                  onClick={handleCheckAvailability}
                  className="flex-1 h-11"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Check Availability
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="h-11"
              >
                Cancel
              </Button>
            </div>

            {saved && (
              <p className="text-sm text-primary text-center">
                Requirements saved! Click "Check Availability" to find matching properties.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
