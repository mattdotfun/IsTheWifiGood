'use client'

import { useEffect, useState } from 'react'
import { supabase, type Tables } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type City = Tables<'cities'>
type Hotel = Tables<'hotels'>
type WifiSummary = Tables<'wifi_summaries'>

interface HotelWithRelations extends Hotel {
  city: City
  wifi_summary?: WifiSummary | WifiSummary[] | null
}

export default function DatabaseTest() {
  const [cities, setCities] = useState<City[]>([])
  const [hotels, setHotels] = useState<HotelWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testDatabaseConnection() {
      try {
        setLoading(true)
        setError(null)

        // Test 1: Fetch all cities
        const { data: citiesData, error: citiesError } = await supabase
          .from('cities')
          .select('*')
          .order('name')

        if (citiesError) throw citiesError
        setCities(citiesData || [])

        // Test 2: Fetch hotels with relationships
        const { data: hotelsData, error: hotelsError } = await supabase
          .from('hotels')
          .select(`
            *,
            city:cities(*),
            wifi_summary:wifi_summaries(*)
          `)
          .limit(6)
          .order('name')

        if (hotelsError) throw hotelsError
        // Process the data to handle wifi_summary arrays
        const processedHotels = hotelsData?.map(hotel => ({
          ...hotel,
          wifi_summary: Array.isArray(hotel.wifi_summary) 
            ? hotel.wifi_summary[0] 
            : hotel.wifi_summary
        })) || []
        setHotels(processedHotels as HotelWithRelations[])

      } catch (err) {
        console.error('Database test error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    testDatabaseConnection()
  }, [])

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">🔍 Testing Database Connection...</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200">
        <h3 className="text-lg font-semibold mb-4 text-red-600">❌ Database Connection Failed</h3>
        <p className="text-red-500 text-sm">Error: {error}</p>
      </Card>
    )
  }

  const getWifiQualityColor = (tier: string | null | undefined) => {
    if (!tier) return 'rgb(156, 163, 175)' // Default gray for missing data
    
    switch (tier.toLowerCase()) {
      case 'excellent': return 'rgb(16, 185, 129)'
      case 'good': return 'rgb(59, 130, 246)'
      case 'moderate': return 'rgb(245, 158, 11)'
      case 'poor': return 'rgb(239, 68, 68)'
      default: return 'rgb(156, 163, 175)'
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">✅ Database Connection Test Results</h3>
      
      {/* Cities Test */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">📍 Cities ({cities.length} found)</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {cities.map((city) => (
            <div key={city.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded">
              <span className="text-2xl">{city.flag_emoji}</span>
              <div>
                <div className="font-medium">{city.name}</div>
                <div className="text-sm text-gray-600">{city.country}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hotels Test */}
      <div>
        <h4 className="font-medium mb-3">🏨 Hotels with WiFi Data ({hotels.length} found)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-medium text-sm">{hotel.name}</h5>
                {hotel.wifi_summary && !Array.isArray(hotel.wifi_summary) && hotel.wifi_summary.speed_tier && (
                  <Badge 
                    className="text-xs"
                    style={{ 
                      backgroundColor: getWifiQualityColor(hotel.wifi_summary.speed_tier),
                      color: 'white'
                    }}
                  >
                    {hotel.wifi_summary.speed_tier?.toUpperCase() || 'N/A'}
                  </Badge>
                )}
              </div>
              
              <div className="text-xs text-gray-600 mb-2">
                {hotel.city.flag_emoji} {hotel.city.name}
                {hotel.hotel_chain && ` • ${hotel.hotel_chain}`}
              </div>

              {hotel.wifi_summary && !Array.isArray(hotel.wifi_summary) && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Score:</span>
                    <span className="font-medium">{hotel.wifi_summary.overall_score != null ? `${hotel.wifi_summary.overall_score}/5` : 'N/A'}</span>
                  </div>
                  {hotel.wifi_summary.estimated_speed_mbps !== null && hotel.wifi_summary.estimated_speed_mbps !== undefined && (
                    <div className="flex justify-between text-xs">
                      <span>Speed:</span>
                      <span className="font-medium">{hotel.wifi_summary.estimated_speed_mbps} Mbps</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <p className="text-sm text-green-700">
          🎉 Database connection successful! All tables are accessible with proper TypeScript types.
        </p>
      </div>
    </Card>
  )
}