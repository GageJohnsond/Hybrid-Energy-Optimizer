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
}

interface EnergyChartsProps {
  cityData: CityData
}

const ENERGY_COLORS = {
  naturalGas: "hsl(var(--chart-1))", // Orange
  petroleum: "hsl(var(--chart-2))", // Dark Gray
  coal: "hsl(var(--chart-3))", // Very Dark Gray
  nuclear: "hsl(var(--chart-4))", // Blue
  wind: "hsl(var(--chart-5))", // Green
  solar: "hsl(var(--chart-6))", // Yellow
  hydro: "hsl(var(--chart-7))", // Cyan
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="font-medium text-green-600">Renewables Increase</div>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
