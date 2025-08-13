'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import WiFiStrengthBars, { getWiFiQuality, getStrengthFromQuality } from '@/components/ui/wifi-strength-bars'
import { cn } from '@/lib/utils'
import { MapPin, Star, Users, Wifi } from 'lucide-react'
import Link from 'next/link'

interface HotelCardProps {
  hotel: {
    id: string
    name: string
    address?: string | null
    star_rating?: number | null
    hotel_chain?: string | null
    city: {
      name: string
      flag_emoji: string
    }
    wifi_summary?: {
      speed_tier: string
      overall_score?: number | null
      estimated_speed_mbps?: number | null
      business_suitable?: boolean | null
      highlights?: any
    } | null
  }
  href?: string
  className?: string
  compact?: boolean
}

export default function HotelCard({ hotel, href, className, compact = false }: HotelCardProps) {
  const wifiQuality = hotel.wifi_summary ? getWiFiQuality(
    hotel.wifi_summary.estimated_speed_mbps !== null ? hotel.wifi_summary.estimated_speed_mbps : undefined, 
    hotel.wifi_summary.overall_score !== null ? hotel.wifi_summary.overall_score : undefined
  ) : 'moderate'
  
  const wifiStrength = hotel.wifi_summary ? getStrengthFromQuality(hotel.wifi_summary.speed_tier) : 3

  const CardWrapper: any = href ? Link : 'div'
  const cardProps = href ? { href } : {}

  return (
    <CardWrapper {...cardProps}>
      <Card className={cn(
        'card-enhanced card-wifi-quality group cursor-pointer transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-1',
        compact ? 'p-4' : '',
        className
      )}>
        {!compact && (
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                  {hotel.name}
                </h3>
                {hotel.hotel_chain && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {hotel.hotel_chain}
                  </p>
                )}
              </div>
              
              {/* Floating Score Badge */}
              {hotel.wifi_summary && (
                <div className="relative">
                  <Badge 
                    className="badge-hover text-xs font-semibold px-2 py-1 transition-all duration-300"
                    style={{ 
                      backgroundColor: wifiQuality === 'excellent' ? '#10B981' : 
                                     wifiQuality === 'good' ? '#3B82F6' : 
                                     wifiQuality === 'moderate' ? '#F59E0B' : '#EF4444',
                      color: 'white'
                    }}
                  >
                    {hotel.wifi_summary.overall_score != null ? hotel.wifi_summary.overall_score.toFixed(1) : 'N/A'}
                  </Badge>
                  {hotel.wifi_summary.business_suitable && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse-glow" />
                  )}
                </div>
              )}
            </div>
          </CardHeader>
        )}

        <CardContent className={compact ? 'p-0' : 'pt-0'}>
          {compact && (
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium text-sm leading-tight">{hotel.name}</h4>
              {hotel.wifi_summary && (
                <Badge 
                  variant="secondary"
                  className="text-xs"
                  style={{ 
                    backgroundColor: wifiQuality === 'excellent' ? '#10B981' : 
                                   wifiQuality === 'good' ? '#3B82F6' : 
                                   wifiQuality === 'moderate' ? '#F59E0B' : '#EF4444',
                    color: 'white'
                  }}
                >
                  {hotel.wifi_summary.overall_score != null ? hotel.wifi_summary.overall_score.toFixed(1) : 'N/A'}
                </Badge>
              )}
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4" />
            <span className="flex items-center gap-1">
              {hotel.city.flag_emoji} {hotel.city.name}
            </span>
            {hotel.star_rating && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{hotel.star_rating}</span>
                </div>
              </>
            )}
          </div>

          {/* WiFi Information */}
          {hotel.wifi_summary && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">WiFi Quality</span>
                </div>
                <WiFiStrengthBars 
                  strength={wifiStrength}
                  quality={wifiQuality}
                  size={compact ? 'sm' : 'md'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Speed</span>
                  <p className="font-medium">
                    {hotel.wifi_summary.estimated_speed_mbps !== null && hotel.wifi_summary.estimated_speed_mbps !== undefined ? 
                      `${hotel.wifi_summary.estimated_speed_mbps} Mbps` : 
                      hotel.wifi_summary.speed_tier ? 
                        hotel.wifi_summary.speed_tier.charAt(0).toUpperCase() + hotel.wifi_summary.speed_tier.slice(1) :
                        'Unknown'
                    }
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Business</span>
                  <p className="font-medium">
                    {hotel.wifi_summary.business_suitable ? '✓ Suitable' : '⚠ Limited'}
                  </p>
                </div>
              </div>

              {/* Highlights */}
              {hotel.wifi_summary.highlights && Array.isArray(hotel.wifi_summary.highlights) && hotel.wifi_summary.highlights.length > 0 && !compact && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {hotel.wifi_summary.highlights.slice(0, 2).map((highlight: string, index: number) => (
                    <Badge 
                      key={index}
                      variant="outline" 
                      className="text-xs px-2 py-0.5 bg-primary/5 text-primary border-primary/20"
                    >
                      {highlight}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Fallback for hotels without WiFi data */}
          {!hotel.wifi_summary && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>WiFi data coming soon</span>
            </div>
          )}
        </CardContent>
      </Card>
    </CardWrapper>
  )
}