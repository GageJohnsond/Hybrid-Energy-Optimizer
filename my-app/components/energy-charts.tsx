// File: my-app/components/energy-charts.tsx
"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
  currentEnergy: EnergyData
  optimizedEnergy: EnergyData
  totalDemand: number
  operationalCosts: Record<string, number>
  basePrices: Record<string, number>
}

interface EnergyChartsProps {
  cityData: CityData
}

// Updated color palette - no black colors
const ENERGY_COLORS = {
  naturalGas: "#f97316", // Orange
  petroleum: "#6b7280", // Gray
  coal: "#374151", // Dark Gray
  nuclear: "#3b82f6", // Blue
  wind: "#10b981", // Green
  solar: "#fbbf24", // Yellow
  hydro: "#06b6d4", // Cyan
}

const ENERGY_LABELS = {
  naturalGas: "Natural Gas",
  petroleum: "Petroleum",
  coal: "Coal",
  nuclear: "Nuclear",
  wind: "Wind",
  solar: "Solar",
  hydro: "Hydro",
}

type UnitType = "percentage" | "mwh"

// Helper function to calculate weighted average cost
function calculateWeightedCost(energyMix: EnergyData, operationalCosts: Record<string, number>, totalDemand: number): number {
  let totalCost = 0;
  let totalGeneration = 0;

  Object.entries(energyMix).forEach(([source, percentage]) => {
    const generation = (percentage / 100) * totalDemand;
    const costPerMWh = operationalCosts[source] || operationalCosts[source.replace(/([A-Z])/g, '_$1').toLowerCase()] || 0;
    totalCost += generation * costPerMWh;
    totalGeneration += generation;
  });

  return totalGeneration > 0 ? totalCost / totalGeneration : 0;
}

export function EnergyCharts({ cityData }: EnergyChartsProps) {
  const [units, setUnits] = useState<UnitType>("percentage")

  const formatChartData = (energyData: EnergyData, isPercentage: boolean) => {
    return Object.entries(energyData).map(([key, value]) => ({
      name: ENERGY_LABELS[key as keyof EnergyData],
      value: isPercentage ? value : (value / 100) * cityData.totalDemand,
      percentage: value,
      color: ENERGY_COLORS[key as keyof EnergyData],
    }))
  }

  const currentData = formatChartData(cityData.currentEnergy, units === "percentage")
  const optimizedData = formatChartData(cityData.optimizedEnergy, units === "percentage")

  // Calculate actual costs
  const currentAvgCost = calculateWeightedCost(cityData.currentEnergy, cityData.operationalCosts, cityData.totalDemand);
  const optimizedAvgCost = calculateWeightedCost(cityData.optimizedEnergy, cityData.operationalCosts, cityData.totalDemand);
  const costReduction = ((currentAvgCost - optimizedAvgCost) / currentAvgCost) * 100;

  // Calculate total annual costs
  const currentTotalCost = currentAvgCost * cityData.totalDemand;
  const optimizedTotalCost = optimizedAvgCost * cityData.totalDemand;
  const totalSavings = currentTotalCost - optimizedTotalCost;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {units === "percentage" ? `${data.percentage.toFixed(1)}%` : `${data.value.toFixed(0)} MWh`}
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {payload.map((entry: any, index: number) => (
          <Badge key={index} variant="outline" className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm">{entry.value}</span>
          </Badge>
        ))}
      </div>
    )
  }

  return (
    <section id="current-vs-optimized" className="py-8 sm:py-12">
      <div className="flex justify-center gap-2 mb-8">
        <Button
          variant={units === "percentage" ? "default" : "outline"}
          onClick={() => setUnits("percentage")}
          size="sm"
        >
          Percentage
        </Button>
        <Button variant={units === "mwh" ? "default" : "outline"} onClick={() => setUnits("mwh")} size="sm">
          MWh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Current Energy Chart */}
        <Card className="border-2">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-semibold">Current Energy Consumption</CardTitle>
            <p className="text-sm text-muted-foreground">Total: {cityData.totalDemand.toLocaleString()} MWh annually</p>
            <p className="text-sm font-medium text-blue-600">
              Avg Cost: ${currentAvgCost.toFixed(2)}/MWh
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {currentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={<CustomLegend />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Optimized Energy Chart */}
        <Card className="border-2">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-semibold">Optimized Energy Consumption</CardTitle>
            <p className="text-sm text-muted-foreground">
              Projected: {cityData.totalDemand.toLocaleString()} MWh annually
            </p>
            <p className="text-sm font-medium text-green-600">
              Avg Cost: ${optimizedAvgCost.toFixed(2)}/MWh
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={optimizedData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {optimizedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={<CustomLegend />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Changes Summary */}
      <div className="mt-12 text-center">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-4">Key Optimization Changes</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="font-medium text-cyan-600">Renewables Increase</div>
                <div className="text-2xl font-bold mt-1">
                  +
                  {(
                    cityData.optimizedEnergy.wind +
                    cityData.optimizedEnergy.solar +
                    cityData.optimizedEnergy.hydro -
                    (cityData.currentEnergy.wind + cityData.currentEnergy.solar + cityData.currentEnergy.hydro)
                  ).toFixed(1)}
                  %
                </div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="font-medium text-blue-600">Fossil Fuel Reduction</div>
                <div className="text-2xl font-bold mt-1">
                  -
                  {(
                    cityData.currentEnergy.naturalGas +
                    cityData.currentEnergy.petroleum +
                    cityData.currentEnergy.coal -
                    (cityData.optimizedEnergy.naturalGas +
                      cityData.optimizedEnergy.petroleum +
                      cityData.optimizedEnergy.coal)
                  ).toFixed(1)}
                  %
                </div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="font-medium text-purple-600">CO₂ Reduction</div>
                <div className="text-2xl font-bold mt-1">~35%</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="font-medium text-green-600">Cost Reduction</div>
                <div className="text-2xl font-bold mt-1">
                  {costReduction > 0 ? '-' : '+'}
                  {Math.abs(costReduction).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  ${Math.abs(totalSavings / 1000000).toFixed(3)}M annual {costReduction > 0 ? 'savings' : 'increase'}
                </div>
              </div>
            </div>
            
            {/* Additional cost breakdown */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-foreground">Current Annual Cost:</div>
                  <div className="text-lg font-bold text-blue-600">
                    ${(currentTotalCost / 1000000).toFixed(3)}M
                  </div>
                  <div className="text-xs text-muted-foreground">
                    (${currentAvgCost.toFixed(2)} per MWh average)
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-foreground">Optimized Annual Cost:</div>
                  <div className="text-lg font-bold text-green-600">
                    ${(optimizedTotalCost / 1000000).toFixed(3)}M
                  </div>
                  <div className="text-xs text-muted-foreground">
                    (${optimizedAvgCost.toFixed(2)} per MWh average)
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}