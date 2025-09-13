"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

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
  return (
    <Card className="glow border-accent/20 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-accent neon-text">Performance Metrics</CardTitle>
        <CardDescription>Real-time system performance indicators</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics.map((metric) => (
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
