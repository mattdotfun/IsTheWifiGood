'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import WiFiStrengthBars from '@/components/ui/wifi-strength-bars'
import { cn } from '@/lib/utils'
import { ArrowRight, MapPin, Zap } from 'lucide-react'
import Link from 'next/link'

interface HeroSectionProps {
  className?: string
}

const cities = [
  { 
    name: 'Singapore', 
    flag: '🇸🇬', 
    hotels: 30,
    href: '/singapore',
    description: 'Business hub with excellent connectivity'
  },
  { 
    name: 'London', 
    flag: '🇬🇧', 
    hotels: 30,
    href: '/london',
    description: 'Financial district premium WiFi'
  },
  { 
    name: 'New York', 
    flag: '🇺🇸', 
    hotels: 30,
    href: '/new-york',
    description: 'Manhattan business hotels'
  },
]

type WiFiQuality = 'excellent' | 'good' | 'moderate' | 'poor';

const wifiQualities: {
  level: 'Excellent' | 'Good' | 'Moderate';
  speed: string;
  color: string;
  strength: number;
  description: string;
}[] = [
  { 
    level: 'Excellent', 
    speed: '200+ Mbps', 
    color: '#10B981',
    strength: 5,
    description: 'Business grade, video calls, streaming'
  },
  { 
    level: 'Good', 
    speed: '50-200 Mbps', 
    color: '#3B82F6',
    strength: 4,
    description: 'Reliable for most business needs'
  },
  { 
    level: 'Moderate', 
    speed: '10-50 Mbps', 
    color: '#F59E0B',
    strength: 3,
    description: 'Basic browsing and email'
  },
]

export default function HeroSection({ className }: HeroSectionProps) {
  return (
    <section className={cn('relative overflow-hidden', className)}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 animate-gradient">
        <div className="absolute inset-0 bg-black/20" />
        {/* Mesh Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20 lg:py-32">
        {/* Main Hero Content */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 animate-fade-in-down">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span className="text-white text-sm font-medium">Never suffer from bad hotel WiFi again</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up">
            <span className="block">Find Hotels With</span>
            <span className="block gradient-text-wifi bg-gradient-to-r from-yellow-200 to-green-200 bg-clip-text text-transparent">
              EXCELLENT WiFi
            </span>
          </h1>

          <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed animate-fade-in-up">
            Compare hotel internet speeds, reliability, and quality across major business destinations. 
            Make informed decisions for your business travel.
          </p>

          {/* WiFi Quality Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
            {wifiQualities.map((wifi, index) => (
              <Card key={wifi.level} className="glass-card p-6 animate-scale-in group cursor-pointer">
                <div className="text-center">
                  <div className="mb-4">
                    <WiFiStrengthBars 
                      strength={wifi.strength}
                      quality={wifi.level.toLowerCase() as WiFiQuality}
                      size="lg"
                      className="justify-center mb-3"
                    />
                    <Badge 
                      className="text-xs font-semibold"
                      style={{ backgroundColor: wifi.color, color: 'white' }}
                    >
                      {wifi.level.toUpperCase()}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-white mb-2">{wifi.speed}</h3>
                  <p className="text-white/80 text-sm">{wifi.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* City Selection */}
        <div className="text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-8">
            Choose Your Destination
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {cities.map((city, index) => (
              <Link key={city.name} href={city.href}>
                <Card className="glass-card p-8 text-center group hover:glass cursor-pointer transition-all duration-300 city-card-hover">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {city.flag}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-200 transition-colors">
                    {city.name}
                  </h3>
                  <p className="text-white/80 mb-3">{city.description}</p>
                  <div className="flex items-center justify-center gap-2 text-white/70">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{city.hotels} hotels analyzed</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-medium">Explore hotels</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16">
          {[
            { label: 'Hotels Analyzed', value: '90+' },
            { label: 'Cities Covered', value: '3' },
            { label: 'WiFi Reviews', value: '1000+' },
            { label: 'Speed Tests', value: '500+' },
          ].map((stat, index) => (
            <div key={stat.label} className="text-center animate-fade-in-up">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-white/80 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}