"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useEnergyData } from "@/hooks/useEnergyData"

const metrics = [
  {
    name: "System Efficiency",
    value: 94,
    target: 95,
    trend: "up",
    change: "+2.1%",
    status: "optimal",
  },
  {
    name: "Load Balance",
    value: 87,
    target: 90,
    trend: "down",
    change: "-1.3%",
    status: "warning",
  },
  {
    name: "Storage Capacity",
    value: 76,
    target: 80,
    trend: "up",
    change: "+5.2%",
    status: "good",
  },
  {
    name: "Grid Stability",
    value: 98,
    target: 95,
    trend: "stable",
    change: "0.0%",
    status: "optimal",
  },
]

export function EnergyMetrics() {
  const { data: energyData, loading, error } = useEnergyData(true, 300000) // Auto-refresh every 5 minutes

  // Calculate metrics from real energy data
  const calculateSystemEfficiency = () => {
    if (!energyData?.optimization.allocation) return 0
    const totalAllocated = Object.values(energyData.optimization.allocation).reduce((sum, alloc) => sum + alloc.mw, 0)
    return totalAllocated > 0 ? Math.min((totalAllocated / energyData.optimization.demand) * 100, 100) : 0
  }

  const calculateLoadBalance = () => {
    if (!energyData?.generationCapacity) return 0
    const total = Object.values(energyData.generationCapacity).reduce((sum, cap) => sum + cap, 0)
    const maxSource = Math.max(...Object.values(energyData.generationCapacity))
    return total > 0 ? ((total - maxSource) / total) * 100 : 0
  }

  const calculateRenewableRatio = () => {
    if (!energyData?.optimization.allocation) return 0
    const renewable = (energyData.optimization.allocation.wind?.mw || 0) + (energyData.optimization.allocation.solar?.mw || 0)
    const total = Object.values(energyData.optimization.allocation).reduce((sum, alloc) => sum + alloc.mw, 0)
    return total > 0 ? (renewable / total) * 100 : 0
  }

  const calculateCostEfficiency = () => {
    if (!energyData?.optimization.totalCost || !energyData?.optimization.demand) return 0
    const costPerMWh = energyData.optimization.totalCost / energyData.optimization.demand
    const maxCost = 50 // Assumed max cost benchmark
    return Math.max(0, ((maxCost - costPerMWh) / maxCost) * 100)
  }

  const realTimeMetrics = energyData ? [
    {
      name: "System Efficiency",
      value: Math.round(calculateSystemEfficiency()),
      target: 95,
      trend: "stable" as const,
      change: "Live",
      status: energyData.optimization.status === 'optimal' ? "optimal" : "warning" as const,
    },
    {
      name: "Load Balance",
      value: Math.round(calculateLoadBalance()),
      target: 90,
      trend: "up" as const,
      change: "Live",
      status: calculateLoadBalance() > 80 ? "good" : "warning" as const,
    },
    {
      name: "Renewable Mix",
      value: Math.round(calculateRenewableRatio()),
      target: 60,
      trend: "up" as const,
      change: "Live",
      status: calculateRenewableRatio() > 50 ? "optimal" : "good" as const,
    },
    {
      name: "Cost Efficiency",
      value: Math.round(calculateCostEfficiency()),
      target: 80,
      trend: "stable" as const,
      change: "Live",
      status: calculateCostEfficiency() > 70 ? "optimal" : "warning" as const,
    },
  ] : metrics

  if (loading) {
    return (
      <Card className="glow border-accent/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-accent neon-text">Performance Metrics</CardTitle>
          <CardDescription>Loading real-time data...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="glow border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-primary neon-text">Performance Metrics</CardTitle>
          <CardDescription>Error loading real-time data: {error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="destructive" className="bg-primary text-primary-foreground">
            DATA ERROR
          </Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glow border-accent/20 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-accent neon-text">Performance Metrics</CardTitle>
        <CardDescription>Real-time system performance indicators</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {realTimeMetrics.map((metric) => (
          <div key={metric.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{metric.name}</span>
                <Badge
                  variant={
                    metric.status === "optimal" ? "default" : metric.status === "warning" ? "destructive" : "secondary"
                  }
                  className={`text-xs ${
                    metric.status === "optimal"
                      ? "bg-accent text-accent-foreground"
                      : metric.status === "warning"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {metric.status.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-sm">
                {metric.trend === "up" && <TrendingUp className="w-4 h-4 text-accent" />}
                {metric.trend === "down" && <TrendingDown className="w-4 h-4 text-primary" />}
                {metric.trend === "stable" && <Minus className="w-4 h-4 text-muted-foreground" />}
                <span
                  className={
                    metric.trend === "up"
                      ? "text-accent"
                      : metric.trend === "down"
                        ? "text-primary"
                        : "text-muted-foreground"
                  }
                >
                  {metric.change}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Current: {metric.value}%</span>
                <span>Target: {metric.target}%</span>
              </div>
              <Progress
                value={metric.value}
                className="h-2"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
