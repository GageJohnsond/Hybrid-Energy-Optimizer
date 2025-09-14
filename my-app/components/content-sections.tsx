import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus, Zap, Leaf, Factory } from "lucide-react"

interface EnergyData {
  naturalGas: number
  petroleum: number
  coal: number
  nuclear: number
  wind: number
  solar: number
  hydro: number
}

interface CityData {
  name: string
  state: string
  region: string
  currentEnergy: EnergyData
  optimizedEnergy: EnergyData
  totalDemand: number
  renewablePercent: number
  co2Intensity: number
}

interface ContentSectionsProps {
  cityData: CityData
}

/** Bar color by source “family” */
function getBarColor(sourceName: string) {
  const s = sourceName.toLowerCase()
  if (s === "nuclear") return "bg-amber-500"
  if (s === "wind" || s === "solar" || s === "hydro") return "bg-emerald-500"
  // fossil fuels
  return "bg-rose-500"
}

/** Thin, labeled percentage bar (0–100) */
function PercentageBar({
  value,
  label,
  colorClass,
}: {
  value: number
  label: string
  colorClass: string
}) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className="space-y-1" aria-label={`${label} percentage bar`}>
      <div className="h-2 w-full rounded-full bg-muted relative overflow-hidden">
        <div
          className={`h-full ${colorClass} rounded-full transition-all`}
          style={{ width: `${clamped}%` }}
          aria-hidden
        />
      </div>
      <div className="text-xs text-muted-foreground">{clamped.toFixed(1)}%</div>
    </div>
  )
}

export function ContentSections({ cityData }: ContentSectionsProps) {
  const renewableIncrease =
    cityData.optimizedEnergy.wind +
    cityData.optimizedEnergy.solar +
    cityData.optimizedEnergy.hydro -
    (cityData.currentEnergy.wind + cityData.currentEnergy.solar + cityData.currentEnergy.hydro)

  const fossilReduction =
    cityData.currentEnergy.naturalGas +
    cityData.currentEnergy.petroleum +
    cityData.currentEnergy.coal -
    (cityData.optimizedEnergy.naturalGas + cityData.optimizedEnergy.petroleum + cityData.optimizedEnergy.coal)

  const energySources = [
    {
      name: "Natural Gas",
      current: cityData.currentEnergy.naturalGas,
      optimized: cityData.optimizedEnergy.naturalGas,
      icon: Factory,
      description: "Primary fossil fuel for electricity generation and heating.",
      change: "Reduced reliance through efficiency improvements and renewable substitution.",
    },
    {
      name: "Petroleum",
      current: cityData.currentEnergy.petroleum,
      optimized: cityData.optimizedEnergy.petroleum,
      icon: Factory,
      description: "Oil-based fuels used primarily for transportation and backup power.",
      change: "Significant reduction through electrification and renewable alternatives.",
    },
    {
      name: "Coal",
      current: cityData.currentEnergy.coal,
      optimized: cityData.optimizedEnergy.coal,
      icon: Factory,
      description: "Traditional fossil fuel being phased out in favor of cleaner alternatives.",
      change: "Minimal usage in optimized scenario, replaced by renewables and natural gas.",
    },
    {
      name: "Nuclear",
      current: cityData.currentEnergy.nuclear,
      optimized: cityData.optimizedEnergy.nuclear,
      icon: Zap,
      description: "Clean baseload power with zero direct carbon emissions.",
      change: "Maintained at current levels to provide reliable carbon-free electricity.",
    },
    {
      name: "Wind",
      current: cityData.currentEnergy.wind,
      optimized: cityData.optimizedEnergy.wind,
      icon: Leaf,
      description: "Renewable energy from onshore and offshore wind farms.",
      change: "Significant expansion through new installations and grid improvements.",
    },
    {
      name: "Solar",
      current: cityData.currentEnergy.solar,
      optimized: cityData.optimizedEnergy.solar,
      icon: Leaf,
      description: "Photovoltaic and thermal solar energy systems.",
      change: "Major growth through rooftop installations and utility-scale projects.",
    },
    {
      name: "Hydro",
      current: cityData.currentEnergy.hydro,
      optimized: cityData.optimizedEnergy.hydro,
      icon: Leaf,
      description: "Renewable energy from rivers, dams, and pumped storage.",
      change: "Modest increase through efficiency upgrades and small-scale projects.",
    },
  ]

  return (
    <div className="space-y-24">
      {/* Key Takeaways */}
      <section id="key-takeaways" className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Key Takeaways</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Essential insights from {cityData.name}'s energy consumption analysis and optimization potential.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">{cityData.totalDemand.toLocaleString()}</div>
              <div className="text-sm font-medium text-muted-foreground">MWh Annual Demand</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-secondary mb-2">{cityData.renewablePercent.toFixed(1)}%</div>
              <div className="text-sm font-medium text-muted-foreground">Current Renewable Share</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-accent mb-2">{cityData.co2Intensity.toFixed(2)}</div>
              <div className="text-sm font-medium text-muted-foreground">kg CO₂ per kWh</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <ul className="space-y-4 text-foreground">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>
                  <strong>Renewable potential:</strong> {cityData.name} could increase renewable energy from{" "}
                  {cityData.renewablePercent.toFixed(1)}% to{" "}
                  {(
                    cityData.optimizedEnergy.wind +
                    cityData.optimizedEnergy.solar +
                    cityData.optimizedEnergy.hydro
                  ).toFixed(1)}
                  % through strategic investments in wind and solar infrastructure.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>
                  <strong>Carbon reduction:</strong> Optimized energy mix could reduce CO₂ emissions by approximately
                  35% while maintaining grid reliability and meeting growing demand.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>
                  <strong>Grid modernization:</strong> Achieving this transition requires smart grid investments, energy
                  storage systems, and updated transmission infrastructure.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>
                  <strong>Economic impact:</strong> The transition creates jobs in renewable energy sectors while
                  reducing long-term energy costs and price volatility.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Source Breakdown */}
      <section id="source-breakdown" className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Source Breakdown</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Detailed analysis of each energy source and how it changes in the optimized scenario.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {energySources.map((source) => {
            const change = source.optimized - source.current
            const ChangeIcon = change > 0.5 ? TrendingUp : change < -0.5 ? TrendingDown : Minus
            const changeColor =
              change > 0.5 ? "text-green-600" : change < -0.5 ? "text-red-600" : "text-muted-foreground"
            const colorClass = getBarColor(source.name)

            return (
              <Card key={source.name} className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <source.icon className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{source.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current</span>
                      <span className="font-medium">{source.current.toFixed(1)}%</span>
                    </div>
                    <Progress value={source.current} className="h-2" />
                    {/* NEW: thin colored bar that visualizes the same percentage */}
                    <PercentageBar value={source.current} label={`${source.name} current`} colorClass={colorClass} />
                  </div>

                  {/* Optimized */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Optimized</span>
                      <span className="font-medium">{source.optimized.toFixed(1)}%</span>
                    </div>
                    <Progress value={source.optimized} className="h-2" />
                    {/* NEW: thin colored bar that visualizes the same percentage */}
                    <PercentageBar
                      value={source.optimized}
                      label={`${source.name} optimized`}
                      colorClass={colorClass}
                    />
                  </div>

                  <div className={`flex items-center gap-2 text-sm ${changeColor}`}>
                    <ChangeIcon className="h-4 w-4" />
                    <span className="font-medium">
                      {change > 0 ? "+" : ""}
                      {change.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{source.description}</p>
                  <div className="pt-2 border-t border-border">
                    <p className="text-sm font-medium text-foreground mb-1">What changed:</p>
                    <p className="text-sm text-muted-foreground">{source.change}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Regional Context */}
      <section id="regional-context" className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Regional Context</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            How {cityData.name} compares to regional and national energy consumption patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Regional Comparison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Renewable Energy Share</span>
                  <Badge variant="outline">{cityData.region} Region</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{cityData.name}</span>
                    <span className="font-medium">{cityData.renewablePercent.toFixed(1)}%</span>
                  </div>
                  <Progress value={cityData.renewablePercent} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Regional Average</span>
                    <span>24.3%</span>
                  </div>
                  <Progress value={24.3} className="h-2 opacity-60" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">CO₂ Intensity</span>
                  <Badge variant="outline">Lower is Better</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{cityData.name}</span>
                    <span className="font-medium">{cityData.co2Intensity.toFixed(2)} kg/kWh</span>
                  </div>
                  <Progress value={(cityData.co2Intensity / 0.8) * 100} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>National Average</span>
                    <span>0.38 kg/kWh</span>
                  </div>
                  <Progress value={(0.38 / 0.8) * 100} className="h-2 opacity-60" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Sources & Methodology</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-foreground mb-1">Grid Region: {cityData.region}</p>
                  <p className="text-muted-foreground">
                    Energy data is sourced from the regional grid operator and represents the electricity mix serving
                    the metropolitan area.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Data Proxy</p>
                  <p className="text-muted-foreground">
                    City-specific data is derived from regional grid data weighted by population and industrial
                    activity. Some values may represent broader metropolitan statistical areas.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Update Frequency</p>
                  <p className="text-muted-foreground">
                    Energy mix data is updated annually based on EIA reporting. Real-time generation data may vary
                    significantly from these annual averages.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What This Means */}
      <section id="what-this-means" className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">What This Means</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Understanding the implications of {cityData.name}'s energy transition pathway.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Environmental Impact</h3>
              <p className="text-muted-foreground leading-relaxed">
                The optimized energy scenario for {cityData.name} represents a significant step toward climate goals. By
                increasing renewable energy from {cityData.renewablePercent.toFixed(1)}% to{" "}
                {(
                  cityData.optimizedEnergy.wind +
                  cityData.optimizedEnergy.solar +
                  cityData.optimizedEnergy.hydro
                ).toFixed(1)}
                %, the city could reduce its carbon footprint by approximately 35%. This transition aligns with national
                decarbonization targets and contributes to improved air quality for residents.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Economic Considerations</h3>
              <p className="text-muted-foreground leading-relaxed">
                While the initial investment in renewable infrastructure requires significant capital, the long-term
                economic benefits are substantial. Renewable energy sources have lower operating costs and provide price
                stability compared to volatile fossil fuel markets. The transition could create thousands of jobs in
                manufacturing, installation, and maintenance of clean energy systems.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Implementation Pathway</h3>
              <p className="text-muted-foreground leading-relaxed">
                Achieving this optimized energy mix requires coordinated action across multiple sectors. Key steps
                include modernizing the electrical grid to handle variable renewable sources, implementing energy
                storage solutions, and updating building codes to encourage efficiency. Policy support through renewable
                energy standards and carbon pricing mechanisms will accelerate the transition.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Grid Reliability</h3>
              <p className="text-muted-foreground leading-relaxed">
                The optimized scenario maintains grid reliability through a balanced approach. Nuclear power provides
                consistent baseload generation, while natural gas serves as flexible backup during periods of low
                renewable output. Advanced forecasting and demand response programs help match supply with consumption
                patterns throughout the day.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Methodology */}
      <section id="methodology" className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Methodology</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Technical approach and data sources used in this energy consumption analysis.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Data Sources</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• U.S. Energy Information Administration (EIA) electricity generation data</li>
                  <li>• Regional transmission organization (RTO) operational data</li>
                  <li>• EPA eGRID database for emissions factors</li>
                  <li>• National Renewable Energy Laboratory (NREL) resource assessments</li>
                  <li>• Local utility integrated resource plans and forecasts</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Optimization Model</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The optimized energy scenario uses a least-cost optimization model that considers renewable resource
                  potential, transmission constraints, and reliability requirements. The model maximizes renewable
                  energy deployment while maintaining grid stability and meeting projected demand growth through 2035.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Assumptions & Limitations</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Technology costs based on NREL Annual Technology Baseline projections</li>
                  <li>• Existing nuclear plants assumed to continue operation through license periods</li>
                  <li>• Grid modernization investments included in optimization constraints</li>
                  <li>• Demand projections incorporate electrification of transportation and heating</li>
                  <li>• Model does not account for potential breakthrough technologies or policy changes</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Update Schedule</h3>
                <p className="text-sm text-muted-foreground">
                  This analysis is updated annually to reflect the latest energy data, technology costs, and policy
                  developments. Real-time generation data may vary significantly from these annual projections due to
                  weather, economic conditions, and operational factors.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
