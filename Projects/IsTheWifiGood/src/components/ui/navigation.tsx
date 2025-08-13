'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Menu, Wifi, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface NavigationProps {
  className?: string
}

const navigationItems = [
  { name: 'Cities', href: '/cities' },
  { name: 'Business Travel', href: '/business-travel' },
  { name: 'Speed Tests', href: '/speed-tests' },
  { name: 'About', href: '/about' },
]

export default function Navigation({ className }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled 
          ? 'glass backdrop-blur-md shadow-lg' 
          : 'bg-transparent',
        className
      )}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Wifi className="w-6 h-6 text-primary" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-lg text-white">
                  IsTheWiFiGood?
                </h1>
                <p className="text-xs text-white/70 -mt-1">
                  Hotel WiFi Directory
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white/90 hover:text-white transition-colors font-medium relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* CTA Button & Mobile Menu */}
            <div className="flex items-center gap-4">
              <Button 
                asChild
                className="hidden sm:inline-flex btn-gradient"
              >
                <Link href="/newsletter">
                  Get Updates
                </Link>
              </Button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-white hover:text-white/80 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          'md:hidden transition-all duration-300 overflow-hidden',
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}>
          <div className="glass-card mx-4 mb-4 rounded-lg">
            <div className="p-6 space-y-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-white/90 hover:text-white transition-colors font-medium py-2"
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/20">
                <Button 
                  asChild
                  className="w-full btn-gradient"
                >
                  <Link 
                    href="/newsletter"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Updates
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding under fixed nav */}
      <div className="h-16 lg:h-20" />
    </>
  )
}

// Smooth scroll utility
export function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}