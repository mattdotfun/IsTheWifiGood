import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function Home() {
  // Test WiFi quality colors
  const testWifiLevels = [
    { level: "excellent", score: 5, color: "rgb(16, 185, 129)" },
    { level: "good", score: 4, color: "rgb(59, 130, 246)" },
    { level: "moderate", score: 3, color: "rgb(245, 158, 11)" },
    { level: "poor", score: 1, color: "rgb(239, 68, 68)" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="animate-gradient bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 py-20">
        <div className="container mx-auto px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-2xl">
            Never Suffer From
            <span className="block gradient-text bg-gradient-to-r from-yellow-200 to-pink-200">
              BAD HOTEL WIFI AGAIN
            </span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Find hotels with excellent Wi-Fi for business travelers. Compare internet speeds, 
            reliability, and quality across major business destinations.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">🚧 Coming Soon</h2>
          <p className="text-lg text-gray-600 mb-8">
            We're building the most comprehensive hotel Wi-Fi quality directory for business travelers.
          </p>
        </div>

        {/* WiFi Quality Demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {testWifiLevels.map((wifi) => (
            <Card key={wifi.level} className="p-6 card-hover cursor-pointer">
              <div className="text-center">
                <div className="mb-4">
                  {/* WiFi Strength Bars */}
                  <div className="flex justify-center gap-1 mb-3">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-3 transition-colors duration-300 ${
                          i < wifi.score ? 'opacity-100' : 'opacity-20'
                        }`}
                        style={{
                          height: `${12 + i * 4}px`,
                          backgroundColor: i < wifi.score ? wifi.color : '#e5e7eb',
                        }}
                      />
                    ))}
                  </div>
                  
                  <Badge 
                    variant="secondary" 
                    className="badge-hover"
                    style={{ backgroundColor: wifi.color, color: 'white' }}
                  >
                    {wifi.level.toUpperCase()}
                  </Badge>
                </div>
                <h3 className="font-semibold capitalize">{wifi.level} WiFi</h3>
                <p className="text-sm text-gray-600">
                  {wifi.level === 'excellent' && '200+ Mbps, Business grade'}
                  {wifi.level === 'good' && '50-200 Mbps, Reliable'}
                  {wifi.level === 'moderate' && '10-50 Mbps, Basic'}
                  {wifi.level === 'poor' && '<10 Mbps, Limited'}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Cities Preview */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold mb-8">Target Cities (MVP)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { city: "Singapore", flag: "🇸🇬", hotels: "30 hotels" },
              { city: "London", flag: "🇬🇧", hotels: "30 hotels" },
              { city: "New York", flag: "🇺🇸", hotels: "30 hotels" },
            ].map((location) => (
              <Card key={location.city} className="p-8 city-card-hover cursor-pointer">
                <div className="text-6xl mb-4">{location.flag}</div>
                <h4 className="text-xl font-bold mb-2">{location.city}</h4>
                <p className="text-gray-600">{location.hotels}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Development Status */}
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold mb-4">🛠️ Development in Progress</h3>
          <p className="text-gray-700 mb-4">
            Phase 1: Project foundation complete ✅<br/>
            Next: Supabase database setup and web scraping implementation
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="outline">Next.js 15</Badge>
            <Badge variant="outline">Shadcn UI</Badge>
            <Badge variant="outline">Tailwind CSS</Badge>
            <Badge variant="outline">Supabase</Badge>
            <Badge variant="outline">OpenAI GPT-5</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
