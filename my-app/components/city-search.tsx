"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

// Sample US cities data - in a real app, this would come from an API
const US_CITIES = [
  { name: "New York", state: "NY", population: 8336817 },
  { name: "Los Angeles", state: "CA", population: 3979576 },
  { name: "Chicago", state: "IL", population: 2693976 },
  { name: "Phoenix", state: "AZ", population: 1680992 },
  { name: "Philadelphia", state: "PA", population: 1584064 },
  { name: "San Diego", state: "CA", population: 1423851 },
  { name: "San Jose", state: "CA", population: 1021795 },
  { name: "Jacksonville", state: "FL", population: 949611 },
  { name: "Columbus", state: "OH", population: 905748 },
  { name: "Charlotte", state: "NC", population: 885708 },
  { name: "San Francisco", state: "CA", population: 873965 },
  { name: "Indianapolis", state: "IN", population: 876384 },
  { name: "Seattle", state: "WA", population: 753675 },
  { name: "Denver", state: "CO", population: 715522 },
  { name: "Boston", state: "MA", population: 685094 },
  { name: "Detroit", state: "MI", population: 670031 },
  { name: "Nashville", state: "TN", population: 689447 },
  { name: "Portland", state: "OR", population: 652503 },
  { name: "Memphis", state: "TN", population: 633104 },
  { name: "Oklahoma City", state: "OK", population: 695755 },
  { name: "Las Vegas", state: "NV", population: 641903 },
  { name: "Louisville", state: "KY", population: 617638 },
  { name: "Baltimore", state: "MD", population: 576498 },
  { name: "Milwaukee", state: "WI", population: 577222 },
  { name: "Albuquerque", state: "NM", population: 564559 },
  { name: "Tucson", state: "AZ", population: 548073 },
  { name: "Fresno", state: "CA", population: 542107 },
  { name: "Mesa", state: "AZ", population: 518012 },
  { name: "Sacramento", state: "CA", population: 524943 },
  { name: "Atlanta", state: "GA", population: 498715 },
  { name: "Kansas City", state: "MO", population: 508090 },
  { name: "Colorado Springs", state: "CO", population: 478961 },
  { name: "Miami", state: "FL", population: 442241 },
  { name: "Raleigh", state: "NC", population: 474069 },
  { name: "Omaha", state: "NE", population: 486051 },
  { name: "Long Beach", state: "CA", population: 466742 },
  { name: "Virginia Beach", state: "VA", population: 459470 },
  { name: "Oakland", state: "CA", population: 440646 },
  { name: "Minneapolis", state: "MN", population: 429954 },
  { name: "Tulsa", state: "OK", population: 413066 },
  { name: "Arlington", state: "TX", population: 394266 },
  { name: "Tampa", state: "FL", population: 384959 },
  { name: "New Orleans", state: "LA", population: 383997 },
  { name: "Wichita", state: "KS", population: 397532 },

  { name: "Houston", state: "TX", population: 2390125 },
  { name: "San Antonio", state: "TX", population: 1526656 },
  { name: "Dallas", state: "TX", population: 1326087 },
  { name: "Fort Worth", state: "TX", population: 1008106 },
  { name: "Austin", state: "TX", population: 993588 },
  { name: "El Paso", state: "TX", population: 681723 },
  { name: "Corpus Christi", state: "TX", population: 317317 },
  { name: "Plano", state: "TX", population: 293286 },
  { name: "Lubbock", state: "TX", population: 272086 },
  { name: "Laredo", state: "TX", population: 261260 },
  { name: "Irving", state: "TX", population: 258060 },
  { name: "Garland", state: "TX", population: 250431 },
  { name: "Frisco", state: "TX", population: 235208 },
  { name: "McKinney", state: "TX", population: 227526 },
  { name: "Grand Prairie", state: "TX", population: 207331 },
  { name: "Amarillo", state: "TX", population: 203729 },
  { name: "Brownsville", state: "TX", population: 191967 },
  { name: "Denton", state: "TX", population: 165998 },
  { name: "Killeen", state: "TX", population: 160616 },
  { name: "Mesquite", state: "TX", population: 150140 },
  { name: "Pasadena", state: "TX", population: 149617 },
  { name: "McAllen", state: "TX", population: 148782 },
  { name: "Waco", state: "TX", population: 146608 },
  { name: "Midland", state: "TX", population: 143687 },
  { name: "Lewisville", state: "TX", population: 135983 },
  { name: "Carrollton", state: "TX", population: 135456 },
  { name: "Round Rock", state: "TX", population: 135359 },
  { name: "Abilene", state: "TX", population: 130501 },
  { name: "Pearland", state: "TX", population: 129620 },
  { name: "College Station", state: "TX", population: 128023 },
  { name: "Odessa", state: "TX", population: 119748 },
  { name: "League City", state: "TX", population: 118456 },
  { name: "Richardson", state: "TX", population: 118221 },
  { name: "The Woodlands", state: "TX", population: 116916 },
  { name: "New Braunfels", state: "TX", population: 116477 },
  { name: "Conroe", state: "TX", population: 114581 },
  { name: "Allen", state: "TX", population: 113746 },
  { name: "Beaumont", state: "TX", population: 112893 },
  { name: "Tyler", state: "TX", population: 112219 },
  { name: "Sugar Land", state: "TX", population: 109851 },
  { name: "Edinburg", state: "TX", population: 108733 },
  { name: "Wichita Falls", state: "TX", population: 102372 },
  { name: "Georgetown", state: "TX", population: 101344 },
  { name: "San Angelo", state: "TX", population: 100159 },
  { name: "Longview", state: "TX", population: 82183 },
  { name: "Baytown", state: "TX", population: 83701 },
  { name: "Missouri City", state: "TX", population: 75348 },
  { name: "Leander", state: "TX", population: 79441 },
  { name: "Cedar Park", state: "TX", population: 77595 },
  { name: "Pharr", state: "TX", population: 79112 },
  { name: "Temple", state: "TX", population: 82073 },
  { name: "Bryan", state: "TX", population: 86357 },
  { name: "San Marcos", state: "TX", population: 75398 },
  { name: "Mansfield", state: "TX", population: 73989 },
  { name: "Flower Mound", state: "TX", population: 78854 },
  { name: "North Richland Hills", state: "TX", population: 71564 },
  { name: "Victoria", state: "TX", population: 68771 },
  { name: "Harlingen", state: "TX", population: 71829 },
  { name: "Euless", state: "TX", population: 61032 },
  { name: "DeSoto", state: "TX", population: 53568 },
  { name: "Grapevine", state: "TX", population: 54151 },
  { name: "Bedford", state: "TX", population: 49145 },
  { name: "Galveston", state: "TX", population: 53219 },
  { name: "Cedar Hill", state: "TX", population: 48337 },
  { name: "Hurst", state: "TX", population: 40413 },
  { name: "Keller", state: "TX", population: 48756 },
  { name: "Coppell", state: "TX", population: 42983 },
  { name: "Huntsville", state: "TX", population: 45941 },
  { name: "Duncanville", state: "TX", population: 40706 },
  { name: "Burleson", state: "TX", population: 51618 },
  { name: "Haltom City", state: "TX", population: 44300 },
  { name: "Lancaster", state: "TX", population: 41275 },
  { name: "Texarkana", state: "TX", population: 36193 },
  { name: "Friendswood", state: "TX", population: 41213 },
  { name: "Wylie", state: "TX", population: 57526 },
  { name: "The Colony", state: "TX", population: 45283 },
  { name: "Del Rio", state: "TX", population: 35591 },
  { name: "Rosenberg", state: "TX", population: 38282 },
  { name: "Pflugerville", state: "TX", population: 70252 },
  { name: "Little Elm", state: "TX", population: 52898 },
  { name: "Mission", state: "TX", population: 84331 },
  { name: "Schertz", state: "TX", population: 42433 },
  { name: "Cleburne", state: "TX", population: 31352 },
  { name: "Weatherford", state: "TX", population: 32718 },
  { name: "Greenville", state: "TX", population: 28976 },
  { name: "Rowlett", state: "TX", population: 65426 },
  { name: "Rockwall", state: "TX", population: 47251 },
  { name: "Southlake", state: "TX", population: 31684 },
  { name: "Colleyville", state: "TX", population: 26766 },
  { name: "Katy", state: "TX", population: 21894 },
  { name: "Spring", state: "TX", population: 62559 },
  { name: "Humble", state: "TX", population: 16795 },
  { name: "Kingwood", state: "TX", population: 71552 },
  { name: "Cypress", state: "TX", population: 165269 },
  { name: "Tomball", state: "TX", population: 12341 },
  { name: "Magnolia", state: "TX", population: 2072 },
]

export function CitySearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const filteredCities = useMemo(() => {
    if (!searchTerm) return US_CITIES.slice(0, 10)
    return US_CITIES.filter(
      (city) =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.state.toLowerCase().includes(searchTerm.toLowerCase()),
    ).slice(0, 10)
  }, [searchTerm])

  const handleCitySelect = (city: { name: string; state: string }) => {
    const citySlug = `${city.name.toLowerCase().replace(/\s+/g, "-")}-${city.state.toLowerCase()}`
    router.push(`/city/${citySlug}`)
  }

  return (
    <section className="relative py-24 sm:py-32 -mt-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Choose a U.S. city..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setIsOpen(true)
                }}
                onFocus={() => setIsOpen(true)}
                className="pl-12 pr-4 py-6 text-lg border-2 border-border focus:border-primary transition-colors"
              />
            </div>

            {isOpen && (
              <Card className="absolute top-full mt-2 w-full z-50 max-h-80 overflow-y-auto border-2 border-border shadow-lg">
                <div className="p-2">
                  {filteredCities.length > 0 ? (
                    filteredCities.map((city) => (
                      <Button
                        key={`${city.name}-${city.state}`}
                        variant="ghost"
                        className="w-full justify-start p-4 h-auto hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          handleCitySelect(city)
                          setIsOpen(false)
                        }}
                      >
                        <MapPin className="mr-3 h-4 w-4 text-muted-foreground" />
                        <div className="text-left">
                          <div className="font-medium text-foreground">
                            {city.name}, {city.state}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Population: {city.population.toLocaleString()}
                          </div>
                        </div>
                      </Button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">No cities found matching "{searchTerm}"</div>
                  )}
                </div>
              </Card>
            )}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Start typing to search from {US_CITIES.length}+ major US cities
            </p>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </section>
  )
}