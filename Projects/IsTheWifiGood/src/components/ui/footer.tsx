'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ExternalLink, Mail, MapPin, Wifi } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface FooterProps {
  className?: string
}

const footerSections = [
  {
    title: 'Cities',
    links: [
      { name: 'Singapore Hotels', href: '/singapore' },
      { name: 'London Hotels', href: '/london' },
      { name: 'New York Hotels', href: '/new-york' },
      { name: 'All Cities', href: '/cities' },
    ]
  },
  {
    title: 'Use Cases',
    links: [
      { name: 'Business Travel', href: '/business-travel' },
      { name: 'Video Calls', href: '/video-calls' },
      { name: 'File Uploads', href: '/file-uploads' },
      { name: 'Streaming', href: '/streaming' },
    ]
  },
  {
    title: 'Resources',
    links: [
      { name: 'WiFi Speed Guide', href: '/speed-guide' },
      { name: 'Hotel Chains', href: '/hotel-chains' },
      { name: 'Speed Tests', href: '/speed-tests' },
      { name: 'About', href: '/about' },
    ]
  },
]

const socialLinks = [
  { name: 'Newsletter', href: 'https://isthewifigood.substack.com', icon: Mail },
]

export default function Footer({ className }: FooterProps) {
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscriptionMessage, setSubscriptionMessage] = useState('')

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || isSubscribing) return

    setIsSubscribing(true)
    
    // Simulate newsletter signup - replace with actual integration
    setTimeout(() => {
      setSubscriptionMessage('Thanks for subscribing!')
      setEmail('')
      setIsSubscribing(false)
      
      // Clear message after 3 seconds
      setTimeout(() => setSubscriptionMessage(''), 3000)
    }, 1000)
  }

  return (
    <footer className={cn('bg-gray-900 text-white', className)}>
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Never Miss Hotel WiFi Updates
            </h2>
            <p className="text-gray-400 mb-6">
              Get notified when we add new cities, hotels, and WiFi quality insights.
            </p>
            
            <form onSubmit={handleNewsletterSignup} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="your.email@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                required
              />
              <Button 
                type="submit" 
                disabled={isSubscribing || !email}
                className="btn-gradient min-w-[120px]"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
            
            {subscriptionMessage && (
              <p className="text-green-400 text-sm mt-3 animate-fade-in-up">
                {subscriptionMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/20">
                <Wifi className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-xl">IsTheWiFiGood?</h3>
                <p className="text-gray-400 text-sm">Hotel WiFi Directory</p>
              </div>
            </Link>
            
            <p className="text-gray-400 mb-6 max-w-md">
              The most comprehensive directory of hotel WiFi quality for business travelers. 
              Make informed decisions based on real speed tests and reviews.
            </p>
            
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                  <span className="text-sm">{social.name}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Featured Cities */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Featured Destinations
          </h4>
          <div className="flex flex-wrap gap-6 text-sm text-gray-400">
            <span>🇸🇬 Singapore (30 hotels)</span>
            <span>🇬🇧 London (30 hotels)</span>
            <span>🇺🇸 New York (30 hotels)</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div>
              © {new Date().getFullYear()} IsTheWiFiGood. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <span className="text-gray-600">•</span>
              <span className="text-xs">
                Made for business travelers 🧳
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}