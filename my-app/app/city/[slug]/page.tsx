// File: my-app/app/city/[slug]/page.tsx
// Updated to use real ERCOT data for Lubbock

import { notFound } from "next/navigation"
import { CityHeader } from "@/components/city-header"
import { EnergyCharts } from "@/components/energy-charts"
import { ContentSections } from "@/components/content-sections"
import { lubbockERCOTData, convertERCOTToAppFormat } from "@/lib/ercot-data"

// Sample city data - in a real app, this would come from an API
function generateCityData(name: string, state: string, population: number) {
  // Generate realistic energy data based on region and population
  const baseNaturalGas = 35 + Math.random() * 25
  const baseCoal = Math.random() * 20
  const baseNuclear = Math.random() * 40
  const baseWind = Math.random() * 15
  const baseSolar = Math.random() * 20
  const baseHydro = Math.random() * 15
  const basePetroleum = Math.random() * 10

  // Normalize to 100%
  const total = baseNaturalGas + baseCoal + baseNuclear + baseWind + baseSolar + baseHydro + basePetroleum

  const currentEnergy = {
    naturalGas: Number(((baseNaturalGas / total) * 100).toFixed(1)),
    petroleum: Number(((basePetroleum / total) * 100).toFixed(1)),
    coal: Number(((baseCoal / total) * 100).toFixed(1)),
    nuclear: Number(((baseNuclear / total) * 100).toFixed(1)),
    wind: Number(((baseWind / total) * 100).toFixed(1)),
    solar: Number(((baseSolar / total) * 100).toFixed(1)),
    hydro: Number(((baseHydro / total) * 100).toFixed(1)),
  }

  // Generate optimized scenario (more renewables, less fossil fuels)
  const optimizedEnergy = {
    naturalGas: Math.max(0, currentEnergy.naturalGas * 0.6),
    petroleum: Math.max(0, currentEnergy.petroleum * 0.3),
    coal: Math.max(0, currentEnergy.coal * 0.2),
    nuclear: currentEnergy.nuclear,
    wind: Math.min(35, currentEnergy.wind * 2.5),
    solar: Math.min(30, currentEnergy.solar * 3),
    hydro: Math.min(20, currentEnergy.hydro * 1.2),
  }

  // Normalize optimized to 100%
  const optimizedTotal = Object.values(optimizedEnergy).reduce((sum, val) => sum + val, 0)
  Object.keys(optimizedEnergy).forEach((key) => {
    optimizedEnergy[key as keyof typeof optimizedEnergy] = Number(
      ((optimizedEnergy[key as keyof typeof optimizedEnergy] / optimizedTotal) * 100).toFixed(1),
    )
  })

  return {
    name,
    state,
    population,
    region: getRegion(state),
    currentEnergy,
    optimizedEnergy,
    totalDemand: Math.floor(population * 0.012 + Math.random() * 1000), // Rough estimate
    renewablePercent: Number((currentEnergy.wind + currentEnergy.solar + currentEnergy.hydro).toFixed(1)),
    co2Intensity: Number((0.2 + Math.random() * 0.4).toFixed(2)),
  }
}

function getRegion(state: string): string {
  const regions: { [key: string]: string } = {
    TX: "ERCOT",
    CA: "CAISO",
    NY: "NYISO",
    IL: "PJM",
    PA: "PJM",
    OH: "PJM",
    FL: "FRCC",
    WA: "WECC",
    OR: "WECC",
    NV: "WECC",
    AZ: "WECC",
    CO: "WECC",
    NM: "WECC",
    UT: "WECC",
    ID: "WECC",
    MT: "WECC",
    WY: "WECC",
    ND: "WECC",
    SD: "WECC",
    NE: "SPP",
    KS: "SPP",
    OK: "SPP",
    AR: "SPP",
    LA: "SPP",
    MO: "SPP",
    IA: "MISO",
    MN: "MISO",
    WI: "MISO",
    IN: "MISO",
    MI: "MISO",
    AL: "SERC",
    GA: "SERC",
    SC: "SERC",
    NC: "SERC",
    TN: "SERC",
    KY: "SERC",
    VA: "PJM",
    WV: "PJM",
    MD: "PJM",
    DE: "PJM",
    NJ: "PJM",
    CT: "ISO-NE",
    RI: "ISO-NE",
    MA: "ISO-NE",
    VT: "ISO-NE",
    NH: "ISO-NE",
    ME: "ISO-NE",
  }
  return regions[state] || "Regional Grid"
}

// All cities from the search component
const ALL_CITIES = [
  // Original cities
  { name: "New York", state: "NY", population: 8336817 },
  { name: "Los Angeles", state: "CA", population: 3979576 },
  { name: "Chicago", state: "IL", population: 2693976 },

  // Texas cities
  { name: "Houston", state: "TX", population: 2390125 },
  { name: "San Antonio", state: "TX", population: 1526656 },
  { name: "Dallas", state: "TX", population: 1326087 },
  { name: "Fort Worth", state: "TX", population: 1008106 },
  { name: "Austin", state: "TX", population: 993588 },
  { name: "El Paso", state: "TX", population: 681723 },
  { name: "Arlington", state: "TX", population: 403672 },
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
]

// Generate city data for all cities, with special handling for Lubbock
const CITY_DATA = ALL_CITIES.reduce(
  (acc, city) => {
    const slug = `${city.name.toLowerCase().replace(/\s+/g, "-")}-${city.state.toLowerCase()}`
    
    // Use real ERCOT data for Lubbock, generated data for others
    if (city.name === "Lubbock" && city.state === "TX") {
      acc[slug] = {
        name: city.name,
        state: city.state,
        population: city.population,
        region: "ERCOT",
        currentEnergy: lubbockERCOTData.currentEnergy,
        optimizedEnergy: lubbockERCOTData.optimizedEnergy,
        totalDemand: lubbockERCOTData.totalDemand,
        renewablePercent: lubbockERCOTData.renewablePercent,
        co2Intensity: lubbockERCOTData.co2Intensity,
      }
    } else {
      acc[slug] = generateCityData(city.name, city.state, city.population)
    }
    
    return acc
  },
  {} as Record<string, any>,
)

interface CityPageProps {
  params: {
    slug: string
  }
}

export default function CityPage({ params }: CityPageProps) {
  const cityData = CITY_DATA[params.slug as keyof typeof CITY_DATA]

  if (!cityData) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      <CityHeader city={cityData} />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <EnergyCharts cityData={cityData} />
        <ContentSections cityData={cityData} />
      </div>
    </main>
  )
}

export function generateStaticParams() {
  return Object.keys(CITY_DATA).map((slug) => ({
    slug,
  }))
}