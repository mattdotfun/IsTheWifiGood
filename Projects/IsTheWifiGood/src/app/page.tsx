'use client'

import { useEffect, useState } from 'react'
import Navigation from '@/components/ui/navigation'
import HeroSection from '@/components/ui/hero-section'
import Footer from '@/components/ui/footer'
import HotelCard from '@/components/ui/hotel-card'
import DatabaseTest from '@/components/DatabaseTest'
import { Badge } from '@/components/ui/badge'
import { supabase, type Tables } from '@/lib/supabase'

type Hotel = Tables<'hotels'> & {
  city: Tables<'cities'>
  wifi_summary?: Tables<'wifi_summaries'>
}

export default function Home() {
  const [featuredHotels, setFeaturedHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeaturedHotels() {
      try {
        const { data, error } = await supabase
          .from('hotels')
          .select(`
            *,
            city:cities(*),
            wifi_summary:wifi_summaries(*)
          `)
          .limit(6)
          .order('name')

        if (error) throw error
        setFeaturedHotels((data as Hotel[]) || [])
      } catch (error) {
        console.error('Error fetching hotels:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedHotels()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <HeroSection />

      {/* Featured Hotels Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Featured Hotels
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover hotels with exceptional WiFi quality, tested and verified for business travelers.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-lg p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredHotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  href={`/hotels/${hotel.id}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Database Test Section (Development) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">🔧 Development Status</h2>
            <p className="text-gray-600">
              Real-time database connection and component testing
            </p>
          </div>
          <DatabaseTest />
        </div>
      </section>

      {/* Progress Section */}
      <section className="py-12 bg-blue-50">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-xl font-bold mb-4">🚀 Development Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-6">
            <div className="bg-white rounded-lg p-6">
              <h4 className="font-semibold text-green-600 mb-2">✅ Phase 1 Complete</h4>
              <p className="text-sm text-gray-600">Database + Design System (96%)</p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <h4 className="font-semibold text-blue-600 mb-2">🔨 Phase 2 Active</h4>
              <p className="text-sm text-gray-600">Core Components Development</p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <h4 className="font-semibold text-gray-500 mb-2">⏳ Phase 3 Next</h4>
              <p className="text-sm text-gray-600">Data Collection System</p>
            </div>
          </div>
          <div className="flex justify-center gap-2">
            <Badge variant="outline">Next.js 15.4.6</Badge>
            <Badge variant="outline">Supabase</Badge>
            <Badge variant="outline">Shadcn UI</Badge>
            <Badge variant="outline">Tailwind CSS v4</Badge>
            <Badge variant="outline">TypeScript</Badge>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
