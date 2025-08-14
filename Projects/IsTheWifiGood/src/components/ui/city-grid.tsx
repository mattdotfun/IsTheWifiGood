'use client'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowRight, MapPin } from 'lucide-react'
import Link from 'next/link'

interface City {
  name: string
  flag: string
  hotels: number
  href: string
  description: string
  country?: string
}

interface CityGridProps {
  cities: City[]
  loading?: boolean
  className?: string
  emptyMessage?: string
  emptyDescription?: string
}

// Default cities data if none provided
const defaultCities: City[] = [
  { 
    name: 'Singapore', 
    flag: '🇸🇬', 
    hotels: 30,
    href: '/singapore',
    description: 'Business hub with excellent connectivity',
    country: 'Singapore'
  },
  { 
    name: 'London', 
    flag: '🇬🇧', 
    hotels: 30,
    href: '/london',
    description: 'Financial district premium WiFi',
    country: 'United Kingdom'
  },
  { 
    name: 'New York', 
    flag: '🇺🇸', 
    hotels: 30,
    href: '/new-york',
    description: 'Manhattan business hotels',
    country: 'United States'
  },
]

// Loading skeleton component
function CityCardSkeleton() {
  return (
    <Card className="glass-card p-8 text-center animate-pulse">
      <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4"></div>
      <div className="h-6 bg-white/20 rounded w-3/4 mx-auto mb-2"></div>
      <div className="h-4 bg-white/20 rounded w-full mx-auto mb-3"></div>
      <div className="h-4 bg-white/20 rounded w-2/3 mx-auto"></div>
    </Card>
  )
}

// Empty state component
function EmptyState({ message, description }: { message?: string, description?: string }) {
  return (
    <div className="col-span-full text-center py-16">
      <div className="text-6xl mb-4">🏨</div>
      <h3 className="text-2xl font-bold text-white mb-2">
        {message || 'No cities available'}
      </h3>
      <p className="text-white/80 max-w-md mx-auto">
        {description || 'We\'re working on adding more cities to our directory. Check back soon!'}
      </p>
    </div>
  )
}

export default function CityGrid({ 
  cities = defaultCities, 
  loading = false,
  className,
  emptyMessage,
  emptyDescription
}: CityGridProps) {
  if (loading) {
    return (
      <div className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto',
        className
      )}>
        {Array.from({ length: 6 }).map((_, index) => (
          <CityCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (cities.length === 0) {
    return (
      <div className={cn('max-w-5xl mx-auto', className)}>
        <EmptyState message={emptyMessage} description={emptyDescription} />
      </div>
    )
  }

  return (
    <div className={cn(
      'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto',
      className
    )}>
      {cities.map((city, index) => (
        <Link key={city.name} href={city.href}>
          <Card className="glass-card p-8 text-center group hover:glass cursor-pointer transition-all duration-300 city-card-hover">
            <div 
              className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300"
              role="img"
              aria-label={`${city.name} flag`}
            >
              {city.flag}
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-200 transition-colors">
              {city.name}
            </h3>
            
            {city.country && (
              <p className="text-white/60 text-sm mb-2">
                {city.country}
              </p>
            )}
            
            <p className="text-white/80 mb-3 min-h-[1.25rem]">
              {city.description}
            </p>
            
            <div className="flex items-center justify-center gap-2 text-white/70 mb-4">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {city.hotels} hotel{city.hotels !== 1 ? 's' : ''} analyzed
              </span>
            </div>
            
            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-sm font-medium">Explore hotels</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}

// Export types for use in other components
export type { City, CityGridProps }