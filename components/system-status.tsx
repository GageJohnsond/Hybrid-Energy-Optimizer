"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, XCircle, Settings, RefreshCw } from "lucide-react"
import { useEnergyData } from "@/hooks/useEnergyData"

const systems = [
  {
    name: "Solar Array Alpha",
    status: "operational",
    efficiency: 94,
    output: "1.2 MW",
    lastMaintenance: "2 days ago",
    alerts: 0,
  },
  {
    name: "Wind Turbine Grid",
    status: "operational",
    efficiency: 87,
    output: "0.8 MW",
    lastMaintenance: "1 week ago",
    alerts: 0,
  },
  {
    name: "Battery Storage Bank",
    status: "warning",
    efficiency: 76,
    output: "0.4 MW",
    lastMaintenance: "3 weeks ago",
    alerts: 2,
  },
  {
    name: "Grid Connection Hub",
    status: "critical",
    efficiency: 45,
    output: "0.2 MW",
    lastMaintenance: "1 month ago",
    alerts: 5,
  },
]

export function SystemStatus() {
  const { data: energyData, loading, refetch } = useEnergyData(true, 300000)

  // Transform real data into system status format
  const realTimeSystems = energyData ? [
    {
      name: "Natural Gas Generation",
      status: energyData.generationCapacity.natural_gas > 1000 ? "operational" : "warning" as const,
      efficiency: Math.round(((energyData.optimization.allocation.natural_gas?.mw || 0) / energyData.generationCapacity.natural_gas) * 100),
      output: `${(energyData.optimization.allocation.natural_gas?.mw || 0).toFixed(1)} MW`,
      lastMaintenance: "Real-time",
      alerts: energyData.optimization.status !== 'optimal' ? 1 : 0,
      capacity: energyData.generationCapacity.natural_gas,
      cost: energyData.optimization.allocation.natural_gas?.cost || 0,
    },
    {
      name: "Wind Generation",
      status: energyData.generationCapacity.wind > 500 ? "operational" : "warning" as const,
      efficiency: Math.round(((energyData.optimization.allocation.wind?.mw || 0) / energyData.generationCapacity.wind) * 100),
      output: `${(energyData.optimization.allocation.wind?.mw || 0).toFixed(1)} MW`,
      lastMaintenance: "Real-time",
      alerts: 0,
      capacity: energyData.generationCapacity.wind,
      cost: energyData.optimization.allocation.wind?.cost || 0,
    },
    {
      name: "Solar Generation",
      status: energyData.generationCapacity.solar > 300 ? "operational" : "critical" as const,
      efficiency: Math.round(((energyData.optimization.allocation.solar?.mw || 0) / energyData.generationCapacity.solar) * 100),
      output: `${(energyData.optimization.allocation.solar?.mw || 0).toFixed(1)} MW`,
      lastMaintenance: "Real-time",
      alerts: energyData.generationCapacity.solar < 200 ? 1 : 0,
      capacity: energyData.generationCapacity.solar,
      cost: energyData.optimization.allocation.solar?.cost || 0,
    },
    {
      name: "Optimization Engine",
      status: energyData.optimization.status === 'optimal' ? "operational" : "critical" as const,
      efficiency: energyData.optimization.status === 'optimal' ? 98 : 45,
      output: `${energyData.optimization.demand.toFixed(1)} MW Target`,
      lastMaintenance: "Real-time",
      alerts: energyData.optimization.status !== 'optimal' ? 3 : 0,
      capacity: energyData.optimization.demand,
      cost: energyData.optimization.totalCost,
    },
  ] : systems

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="w-4 h-4 text-accent" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-secondary" />
      case "critical":
        return <XCircle className="w-4 h-4 text-primary" />
      default:
        return <CheckCircle className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-accent text-accent-foreground"
      case "warning":
        return "bg-secondary text-secondary-foreground"
      case "critical":
        return "bg-primary text-primary-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card className="glow border-chart-4/20 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-chart-4 neon-text">System Status</CardTitle>
            <CardDescription>Real-time component monitoring</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="glow-yellow bg-transparent"
            onClick={() => refetch()}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {realTimeSystems.map((system) => (
          <div key={system.name} className="p-4 rounded-lg border border-border/50 bg-background/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(system.status)}
                <h4 className="font-medium">{system.name}</h4>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(system.status)}>{system.status.toUpperCase()}</Badge>
                {system.alerts > 0 && (
                  <Badge variant="destructive" className="bg-primary text-primary-foreground">
                    {system.alerts} alerts
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Output:</span>
                <span className="ml-2 font-medium text-accent">{system.output}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Last Service:</span>
                <span className="ml-2">{system.lastMaintenance}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Efficiency</span>
                <span>{system.efficiency}%</span>
              </div>
              <Progress
                value={system.efficiency}
                className="h-2"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                }}
              />
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" className="text-xs bg-transparent">
                <Settings className="w-3 h-3 mr-1" />
                Configure
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
