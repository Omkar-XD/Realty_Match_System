'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  variant?: 'default' | 'primary' | 'warning' | 'success'
  isActive?: boolean
  onClick?: () => void
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  variant = 'default',
  isActive = false,
  onClick
}: StatCardProps) {
  const variantStyles = {
    default: 'bg-card',
    primary: 'bg-primary/10',
    warning: 'bg-amber-100',
    success: 'bg-primary/5',
  }

  const activeStyles = {
    default: 'ring-2 ring-primary',
    primary: 'ring-2 ring-primary',
    warning: 'ring-2 ring-amber-500',
    success: 'ring-2 ring-primary',
  }

  const iconStyles = {
    default: 'text-primary',
    primary: 'text-primary',
    warning: 'text-amber-600',
    success: 'text-primary',
  }

  return (
    <Card 
      className={`${variantStyles[variant]} ${isActive ? activeStyles[variant] : ''} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full bg-background ${iconStyles[variant]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
