'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PropertyCard } from '@/components/property-card'
import type { PropertyWithScore, Property } from '@/lib/types'
import { SearchX } from 'lucide-react'

interface MatchingResultsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  results: PropertyWithScore[]
}

export function MatchingResultsModal({
  open,
  onOpenChange,
  results,
}: MatchingResultsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Matching Properties ({results.length})
          </DialogTitle>
        </DialogHeader>

        {results.length === 0 ? (
          <div className="text-center py-12">
            <SearchX className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Matches Found</h3>
            <p className="text-muted-foreground">
              No suitable properties available currently that match the requirements.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((property) => (
              <PropertyCard
                key={property.id}
                property={property as Property}
                onEdit={() => {}}
                showMatchScore
                matchScore={property.score}
              />
            ))}
          </div>
        )}

        <div className="pt-4">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full h-12 text-base"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
