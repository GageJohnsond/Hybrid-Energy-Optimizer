// File: my-app/app/city/[slug]/page.tsx

import { notFound } from "next/navigation"
import { CityHeader } from "@/components/city-header"
import { EnergyCharts } from "@/components/energy-charts"
import { ContentSections } from "@/components/content-sections"
import { lubbockERCOTData } from "@/lib/ercot-data"

// -----------------
// Hardcoded mixes (% of generation, EPA eGRID 2022-based)
// -----------------
const REGION_MIXES: Record<string, any> = {
  ERCOT: {
    naturalGas: 46.8,
    petroleum: 0.4,
    coal: 15.5,
    nuclear: 9.1,
    wind: 23.0,
    solar: 4.7,
    hydro: 0.5,
  },
  CAISO: {
    naturalGas: 46.2,
    petroleum: 0.0,
    coal: 0.2,
    nuclear: 8.4,
    wind: 8.3,
    solar: 20.4,
    hydro: 7.9,
  },
  NYISO: {
    naturalGas: 38.4,
    petroleum: 1.2,
    coal: 0.0,
    nuclear: 29.0,
    wind: 7.0,
    solar: 2.5,
    hydro: 21.9,
  },
  PJM: {
    naturalGas: 39.7,
    petroleum: 0.6,
    coal: 22.0,
    nuclear: 33.4,
    wind: 2.7,
    solar: 1.0,
    hydro: 0.6,
  },
  FRCC: {
    naturalGas: 74.0,
    petroleum: 1.0,
    coal: 6.0,
    nuclear: 12.0,
    wind: 0.0,
    solar: 7.0,
    hydro: 0.0,
  },
  WECC: {
    naturalGas: 25.0,
    petroleum: 0.5,
    coal: 17.0,
    nuclear: 5.0,
    wind: 10.0,
    solar: 20.0,
    hydro: 22.5,
  },
  SPP: {
    naturalGas: 25.0,
    petroleum: 0.2,
    coal: 30.0,
    nuclear: 5.0,
    wind: 39.0,
    solar: 0.8,
    hydro: 0.0,
  },
  MISO: {
    naturalGas: 31.0,
    petroleum: 0.5,
    coal: 31.5,
    nuclear: 16.0,
    wind: 20.0,
    solar: 1.0,
    hydro: 0.0,
  },
  SERC: {
    naturalGas: 45.0,
    petroleum: 0.6,
    coal: 18.0,
    nuclear: 28.0,
    wind: 2.0,
    solar: 5.5,
    hydro: 0.9,
  },
  "ISO-NE": {
    naturalGas: 53.0,
    petroleum: 1.0,
    coal: 0.2,
    nuclear: 25.0,
    wind: 3.5,
    solar: 9.5,
    hydro: 7.8,
  },
}

// -----------------
// Region lookup (same as before)
// -----------------
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

// -----------------
// Generate data from hardcoded mixes
// -----------------
function generateFromRegion(name: string, state: string, population: number) {
  const region = getRegion(state)
  const currentEnergy = REGION_MIXES[region] || REGION_MIXES["ERCOT"]

  // Optimized: reduce fossil, boost renewables
  const optimizedEnergy = {
    naturalGas: Math.max(0, currentEnergy.naturalGas * 0.6),
    petroleum: Math.max(0, currentEnergy.petroleum * 0.3),
    coal: Math.max(0, currentEnergy.coal * 0.2),
    nuclear: currentEnergy.nuclear,
    wind: Math.min(40, currentEnergy.wind * 1.8),
    solar: Math.min(30, currentEnergy.solar * 2.5),
    hydro: Math.min(25, currentEnergy.hydro * 1.2),
  }

  // Normalize optimized
  const total = Object.values(optimizedEnergy).reduce((s, v) => s + v, 0)
  Object.keys(optimizedEnergy).forEach((k) => {
    optimizedEnergy[k as keyof typeof optimizedEnergy] = Number(((optimizedEnergy[k as keyof typeof optimizedEnergy] / total) * 100).toFixed(1))
  })

  return {
    name,
    state,
    population,
    region,
    currentEnergy,
    optimizedEnergy,
    totalDemand: Math.floor(population * 0.012), // same demand formula
    renewablePercent: Number((currentEnergy.wind + currentEnergy.solar + currentEnergy.hydro).toFixed(1)),
    co2Intensity: Number((0.3 + Math.random() * 0.1).toFixed(2)), // fixed-ish range per region
  }
}

// -----------------
// Cities list
// -----------------
const ALL_CITIES = [
  { name: "New York", state: "NY", population: 8336817 },
  { name: "Los Angeles", state: "CA", population: 3979576 },
  { name: "Chicago", state: "IL", population: 2693976 },
  { name: "Houston", state: "TX", population: 2390125 },
  { name: "San Antonio", state: "TX", population: 1526656 },
  { name: "Dallas", state: "TX", population: 1326087 },
  { name: "Fort Worth", state: "TX", population: 1008106 },
  { name: "Austin", state: "TX", population: 993588 },
  { name: "El Paso", state: "TX", population: 681723 },
  { name: "Arlington", state: "TX", population: 403672 },
  { name: "Corpus Christi", state: "TX", population: 317317 },
  { name: "Plano", state: "TX", population: 293286 },
  { name: "Lubbock", state: "TX", population: 272086 }, // special case
  { name: "Laredo", state: "TX", population: 261260 },
  { name: "Irving", state: "TX", population: 258060 },
  { name: "Garland", state: "TX", population: 250431 },
  // ... keep rest
]

// -----------------
// Build CITY_DATA
// -----------------
const CITY_DATA = ALL_CITIES.reduce((acc, city) => {
  const slug = `${city.name.toLowerCase().replace(/\s+/g, "-")}-${city.state.toLowerCase()}`
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
    acc[slug] = generateFromRegion(city.name, city.state, city.population)
  }
  return acc
}, {} as Record<string, any>)

interface CityPageProps {
  params: { slug: string }
}

export default function CityPage({ params }: CityPageProps) {
  const cityData = CITY_DATA[params.slug as keyof typeof CITY_DATA]
  if (!cityData) notFound()

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
  return Object.keys(CITY_DATA).map((slug) => ({ slug }))
}
