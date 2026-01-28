'use client'

import { useState, useMemo } from 'react'
import { useData } from '@/contexts/data-context'
import { PropertyCard } from '@/components/property-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Plus } from 'lucide-react'
import type { Property, PropertyStatus, PropertyFor, PropertyType, Area } from '@/lib/types'

type FilterStatus = 'all' | PropertyStatus
type FilterFor = 'all' | PropertyFor
type FilterType = 'all' | PropertyType
type FilterArea = 'all' | Area

interface OwnersPageProps {
  onAddProperty: () => void
  onEditProperty: (property: Property) => void
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

export function OwnersPage({ onAddProperty, onEditProperty }: OwnersPageProps) {
  const { properties } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [forFilter, setForFilter] = useState<FilterFor>('all')
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')
  const [areaFilter, setAreaFilter] = useState<FilterArea>('all')

  const filteredProperties = useMemo(() => {
    let result = properties

    // Apply filters
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter)
    }
    if (forFilter !== 'all') {
      result = result.filter((p) => p.property_for === forFilter)
    }
    if (typeFilter !== 'all') {
      result = result.filter((p) => p.property_type === typeFilter)
    }
    if (areaFilter !== 'all') {
      result = result.filter((p) => p.area === areaFilter)
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.owner_name.toLowerCase().includes(query) ||
          p.owner_phone.toLowerCase().includes(query)
      )
    }

    // Sort by created_at descending
    return result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [properties, statusFilter, forFilter, typeFilter, areaFilter, searchQuery])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Owners</h1>
          <p className="text-muted-foreground">Manage property listings</p>
        </div>
        <Button onClick={onAddProperty} className="h-12 px-6">
          <Plus className="w-5 h-5 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by owner name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FilterStatus)}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
              <SelectItem value="Sold/Rented">Sold/Rented</SelectItem>
            </SelectContent>
          </Select>
          <Select value={forFilter} onValueChange={(v) => setForFilter(v as FilterFor)}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="For" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Rent/Buy</SelectItem>
              <SelectItem value="Rent">Rent</SelectItem>
              <SelectItem value="Buy">Buy</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as FilterType)}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Flat/Plot</SelectItem>
              <SelectItem value="Flat">Flat</SelectItem>
              <SelectItem value="Plot">Plot</SelectItem>
            </SelectContent>
          </Select>
          <Select value={areaFilter} onValueChange={(v) => setAreaFilter(v as FilterArea)}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Areas</SelectItem>
              {areas.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredProperties.length} propert{filteredProperties.length === 1 ? 'y' : 'ies'}
      </p>

      {/* Property List */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredProperties.map((property) => (
          <PropertyCard key={property.id} property={property} onEdit={onEditProperty} />
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No properties found</p>
        </div>
      )}
    </div>
  )
}
