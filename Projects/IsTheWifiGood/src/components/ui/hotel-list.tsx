'use client'

import HotelCard from '@/components/ui/hotel-card'
import { cn } from '@/lib/utils'
import { Wifi, Search, MapPin } from 'lucide-react'
import { Tables } from '@/lib/supabase'

// Define the Hotel type based on the existing HotelCard interface
type WifiSummaryProp = Tables<'wifi_summaries'>
type Hotel = Tables<'hotels'> & {
  city: Tables<'cities'>
  wifi_summary?: WifiSummaryProp | null
}

interface HotelListProps {
  hotels: Hotel[]
  loading?: boolean
  compact?: boolean
  className?: string
  emptyMessage?: string
  emptyDescription?: string
  showCount?: boolean
}

// Loading skeleton component that matches HotelCard structure
function HotelCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn(
      'card-enhanced animate-pulse',
      compact ? 'p-4' : 'p-6'
    )}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            {!compact && <div className="h-4 bg-gray-200 rounded w-1/2"></div>}
          </div>
          <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>

        {/* WiFi Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-2 h-6 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="h-3 bg-gray-200 rounded w-10 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div>
              <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-14"></div>
            </div>
          </div>

          {!compact && (
            <div className="flex gap-1">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Empty state component
function EmptyState({ 
  message = 'No hotels found', 
  description = 'Try adjusting your filters or search in a different location.' 
}: { 
  message?: string
  description?: string 
}) {
  return (
    <div className="col-span-full text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {message}
      </h3>
      <p className="text-gray-600 max-w-md mx-auto mb-8">
        {description}
      </p>
      <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4" />
          <span>WiFi Quality Data</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>Multiple Locations</span>
        </div>
      </div>
    </div>
  )
}

export default function HotelList({ 
  hotels, 
  loading = false,
  compact = false,
  className,
  emptyMessage,
  emptyDescription,
  showCount = true
}: HotelListProps) {
  // Loading state
  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        {showCount && (
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <HotelCardSkeleton key={index} compact={compact} />
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (hotels.length === 0) {
    return (
      <div className={cn('space-y-6', className)}>
        {showCount && (
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Hotels</h2>
            <p className="text-sm text-gray-500">0 hotels found</p>
          </div>
        )}
        <div className="min-h-[400px] flex items-center justify-center">
          <EmptyState message={emptyMessage} description={emptyDescription} />
        </div>
      </div>
    )
  }

  // Main content
  return (
    <div className={cn('space-y-6', className)}>
      {showCount && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Hotels
          </h2>
          <p className="text-sm text-gray-500">
            {hotels.length} hotel{hotels.length !== 1 ? 's' : ''} found
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <HotelCard
            key={hotel.id}
            hotel={hotel}
            href={`/hotels/${hotel.id}`}
            compact={compact}
          />
        ))}
      </div>
    </div>
  )
}

// Export types for use in other components
export type { Hotel, HotelListProps }