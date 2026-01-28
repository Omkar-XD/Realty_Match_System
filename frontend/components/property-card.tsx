'use client'

import { useData } from '@/contexts/data-context'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Phone, MessageCircle, Pencil, Trash2 } from 'lucide-react'
import type { Property, PropertyStatus } from '@/lib/types'

interface PropertyCardProps {
  property: Property
  onEdit: (property: Property) => void
  showMatchScore?: boolean
  matchScore?: number
}

const statusColors: Record<PropertyStatus, string> = {
  Available: 'bg-emerald-100 text-emerald-800',
  'On Hold': 'bg-amber-100 text-amber-800',
  'Sold/Rented': 'bg-gray-100 text-gray-800',
}

export function PropertyCard({
  property,
  onEdit,
  showMatchScore,
  matchScore,
}: PropertyCardProps) {
  const { deleteProperty } = useData()
  const { isAdmin } = useAuth()

  const handleCall = () => {
    const phone = property.owner_phone.replace(/\s/g, '')
    window.location.href = `tel:${phone}`
  }

  const handleWhatsApp = () => {
    const phone = property.owner_phone.replace(/\s/g, '').replace('+', '')
    window.open(`https://wa.me/${phone}`, '_blank')
  }

  const formatPrice = (min: number, max: number, propertyFor: string) => {
    if (propertyFor === 'Rent') {
      // For rent, display in rupees
      const minPrice = min.toLocaleString('en-IN')
      const maxPrice = max.toLocaleString('en-IN')
      if (min === max) return `₹${minPrice}/mo`
      return `₹${minPrice} - ₹${maxPrice}/mo`
    } else {
      // For buy, display in lakhs
      const minLakhs = (min / 100000).toFixed(2)
      const maxLakhs = (max / 100000).toFixed(2)
      if (min === max) return `₹${minLakhs}L`
      return `₹${minLakhs}L - ₹${maxLakhs}L`
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* Match Score */}
        {showMatchScore && matchScore !== undefined && (
          <div className="flex items-center justify-between">
            <Badge className="bg-primary text-primary-foreground text-base px-3 py-1">
              {matchScore}% Match
            </Badge>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold truncate">{property.owner_name}</p>
            <p className="text-xl font-bold truncate">{property.owner_phone}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              size="icon"
              variant="default"
              className="h-10 w-10 bg-emerald-600 hover:bg-emerald-700"
              onClick={handleCall}
              aria-label="Call owner"
            >
              <Phone className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="default"
              className="h-10 w-10 bg-emerald-600 hover:bg-emerald-700"
              onClick={handleWhatsApp}
              aria-label="WhatsApp owner"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Property Details */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{property.property_for}</Badge>
          <Badge variant="secondary">{property.property_type}</Badge>
          {property.bhk && <Badge variant="secondary">{property.bhk}</Badge>}
          <Badge variant="secondary">{property.area}</Badge>
        </div>

        {/* Price & Area */}
        <div className="flex items-center gap-4 text-base">
          <span className="font-semibold">
            {formatPrice(property.price_min, property.price_max, property.property_for)}
          </span>
          {property.carpet_area && (
            <span className="text-muted-foreground">{property.carpet_area} sq ft</span>
          )}
        </div>

        {/* Status */}
        <Badge className={statusColors[property.status]}>{property.status}</Badge>

        {/* Notes */}
        {property.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2">{property.notes}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1 h-11 bg-transparent" onClick={() => onEdit(property)}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
          {isAdmin && (
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
              onClick={() => deleteProperty(property.id)}
              aria-label="Delete property"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
