'use client'

import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface WiFiStrengthBarsProps {
  strength: number // 1-5 scale
  quality?: 'excellent' | 'good' | 'moderate' | 'poor'
  animated?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const qualityColors = {
  excellent: '#10B981', // Emerald
  good: '#3B82F6',      // Blue  
  moderate: '#F59E0B',  // Amber
  poor: '#EF4444',      // Red
} as const

const sizeConfig = {
  sm: { width: 'w-2', maxHeight: 16, gap: 'gap-0.5' },
  md: { width: 'w-3', maxHeight: 20, gap: 'gap-1' },
  lg: { width: 'w-4', maxHeight: 24, gap: 'gap-1.5' },
} as const

export default function WiFiStrengthBars({ 
  strength, 
  quality = 'moderate', 
  animated = true,
  size = 'md',
  className 
}: WiFiStrengthBarsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted && animated) {
    // Return static version during SSR
    return (
      <div className={cn(`flex items-end ${sizeConfig[size].gap}`, className)}>
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={`${sizeConfig[size].width} opacity-20 bg-gray-300`}
            style={{
              height: `${8 + i * 3}px`,
            }}
          />
        ))}
      </div>
    )
  }

  const color = qualityColors[quality]
  const { width, maxHeight, gap } = sizeConfig[size]

  return (
    <div className={cn(`flex items-end ${gap}`, className)}>
      {Array.from({ length: 5 }, (_, i) => {
        const isActive = i < strength
        const barHeight = 8 + i * 3
        
        return (
          <div
            key={i}
            className={cn(
              width,
              'transition-all duration-300 rounded-sm',
              isActive ? 'opacity-100' : 'opacity-20',
              animated && isActive && 'animate-wifi-bars'
            )}
            style={{
              height: `${barHeight}px`,
              backgroundColor: isActive ? color : '#e5e7eb',
              animationDelay: animated ? `${i * 0.1}s` : '0s',
            }}
          />
        )
      })}
    </div>
  )
}

// Utility function to determine quality from speed or score
export function getWiFiQuality(speedMbps?: number, score?: number): 'excellent' | 'good' | 'moderate' | 'poor' {
  if (speedMbps) {
    if (speedMbps >= 200) return 'excellent'
    if (speedMbps >= 50) return 'good'
    if (speedMbps >= 10) return 'moderate'
    return 'poor'
  }
  
  if (score) {
    if (score >= 4.5) return 'excellent'
    if (score >= 3.5) return 'good'
    if (score >= 2.5) return 'moderate'
    return 'poor'
  }
  
  return 'moderate'
}

// Utility function to get strength from quality
export function getStrengthFromQuality(quality: string | null | undefined): number {
  if (!quality) return 3 // Default to moderate if no quality provided
  
  switch (quality.toLowerCase()) {
    case 'excellent': return 5
    case 'good': return 4
    case 'moderate': return 3
    case 'poor': return 1
    default: return 3
  }
}