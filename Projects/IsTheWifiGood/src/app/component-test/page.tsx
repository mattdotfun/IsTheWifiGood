'use client'

import { useEffect, useState } from 'react'
import CityGrid from '@/components/ui/city-grid'
import HotelList from '@/components/ui/hotel-list'
import Navigation from '@/components/ui/navigation'
import Footer from '@/components/ui/footer'
import { supabase, type Tables } from '@/lib/supabase'

type WifiSummaryProp = Tables<'wifi_summaries'>
type Hotel = Tables<'hotels'> & {
  city: Tables<'cities'>
  wifi_summary?: WifiSummaryProp | null
}

export default function ComponentTestPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHotels() {
      try {
        const { data, error } = await supabase
          .from('hotels')
          .select(`
            *,
            city:cities(*),
            wifi_summary:wifi_summaries(*)
          `)
          .limit(9)

        if (error) throw error
        
        const processedData = data?.map(hotel => ({
          ...hotel,
          wifi_summary: Array.isArray(hotel.wifi_summary) 
            ? hotel.wifi_summary[0] 
            : hotel.wifi_summary
        })) || []
        
        setHotels(processedData as Hotel[])
      } catch (error) {
        console.error('Error fetching hotels:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHotels()
  }, [])

  const customCities = [
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
    { 
      name: 'Tokyo', 
      flag: '🇯🇵', 
      hotels: 25,
      href: '/tokyo',
      description: 'High-speed connectivity capital',
      country: 'Japan'
    },
    { 
      name: 'Dubai', 
      flag: '🇦🇪', 
      hotels: 20,
      href: '/dubai',
      description: 'Luxury business hotels',
      country: 'United Arab Emirates'
    },
    { 
      name: 'Frankfurt', 
      flag: '🇩🇪', 
      hotels: 15,
      href: '/frankfurt',
      description: 'European financial center',
      country: 'Germany'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="py-16">
        <div className="container mx-auto px-6 space-y-16">
          
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Component Testing</h1>
            <p className="text-xl text-gray-600">Testing the new CityGrid and HotelList components</p>
          </div>

          {/* City Grid Test */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">City Grid Component</h2>
              <p className="text-gray-600">3-column responsive grid with flag animations</p>
            </div>
            
            {/* Normal state */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden rounded-xl p-12 mb-8">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10">
                <h3 className="text-white text-xl font-semibold mb-6 text-center">Normal State (6 cities)</h3>
                <CityGrid cities={customCities} />
              </div>
            </div>

            {/* Loading state */}
            <div className="bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 relative overflow-hidden rounded-xl p-12 mb-8">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10">
                <h3 className="text-white text-xl font-semibold mb-6 text-center">Loading State</h3>
                <CityGrid loading={true} />
              </div>
            </div>

            {/* Empty state */}
            <div className="bg-gradient-to-br from-red-600 via-pink-600 to-orange-600 relative overflow-hidden rounded-xl p-12">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10">
                <h3 className="text-white text-xl font-semibold mb-6 text-center">Empty State</h3>
                <CityGrid cities={[]} />
              </div>
            </div>
          </section>

          {/* Hotel List Test */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Hotel List Component</h2>
              <p className="text-gray-600">Responsive grid with loading states and hotel cards</p>
            </div>

            <div className="space-y-8">
              {/* Normal state */}
              <div className="bg-white rounded-xl p-8 shadow-sm border">
                <h3 className="text-xl font-semibold mb-6">Normal State (with real data)</h3>
                <HotelList hotels={hotels} loading={loading} />
              </div>

              {/* Compact variant */}
              <div className="bg-white rounded-xl p-8 shadow-sm border">
                <h3 className="text-xl font-semibold mb-6">Compact Variant</h3>
                <HotelList hotels={hotels.slice(0, 3)} compact={true} showCount={false} />
              </div>

              {/* Loading state */}
              <div className="bg-white rounded-xl p-8 shadow-sm border">
                <h3 className="text-xl font-semibold mb-6">Loading State</h3>
                <HotelList hotels={[]} loading={true} />
              </div>

              {/* Empty state */}
              <div className="bg-white rounded-xl p-8 shadow-sm border">
                <h3 className="text-xl font-semibold mb-6">Empty State</h3>
                <HotelList 
                  hotels={[]} 
                  emptyMessage="No hotels match your criteria" 
                  emptyDescription="Try searching in a different city or adjusting your preferences." 
                />
              </div>
            </div>
          </section>

        </div>
      </main>
      
      <Footer />
    </div>
  )
}