"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RotateCcw, Zap, Target, TrendingUp } from "lucide-react"

export function OptimizationControls() {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [solarPriority, setSolarPriority] = useState([75])
  const [windPriority, setWindPriority] = useState([60])
  const [storageThreshold, setStorageThreshold] = useState([80])
  const [autoOptimize, setAutoOptimize] = useState(true)

  return (
    <div className="space-y-6">
      {/* Optimization Status */}
      <Card className="glow border-accent/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-accent neon-text">Optimization Engine</CardTitle>
              <CardDescription>AI-powered energy optimization controls</CardDescription>
            </div>
            <Badge
              className={
                isOptimizing ? "bg-accent text-accent-foreground pulse-glow" : "bg-muted text-muted-foreground"
              }
            >
              {isOptimizing ? "OPTIMIZING" : "STANDBY"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsOptimizing(!isOptimizing)}
              className={isOptimizing ? "bg-primary hover:bg-primary/90" : "bg-accent hover:bg-accent/90"}
            >
              {isOptimizing ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isOptimizing ? "Stop Optimization" : "Start Optimization"}
            </Button>
            <Button variant="outline" className="glow-yellow bg-transparent">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm">Auto-Optimize</span>
              <Switch checked={autoOptimize} onCheckedChange={setAutoOptimize} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Tabs */}
      <Tabs defaultValue="priorities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur">
          <TabsTrigger
            value="priorities"
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            Energy Priorities
          </TabsTrigger>
          <TabsTrigger
            value="thresholds"
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            Thresholds
          </TabsTrigger>
          <TabsTrigger
            value="scenarios"
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            Scenarios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="priorities" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glow-yellow border-secondary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-secondary neon-text flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Solar Priority
                </CardTitle>
                <CardDescription>Adjust solar energy utilization priority</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Priority Level</span>
                    <span className="text-secondary font-medium">{solarPriority[0]}%</span>
                  </div>
                  <Slider
                    value={solarPriority}
                    onValueChange={setSolarPriority}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Higher priority means solar energy will be preferred over other sources when available.
                </div>
              </CardContent>
            </Card>

            <Card className="glow border-chart-4/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-chart-4 neon-text flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Wind Priority
                </CardTitle>
                <CardDescription>Adjust wind energy utilization priority</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Priority Level</span>
                    <span className="text-chart-4 font-medium">{windPriority[0]}%</span>
                  </div>
                  <Slider value={windPriority} onValueChange={setWindPriority} max={100} step={5} className="w-full" />
                </div>
                <div className="text-xs text-muted-foreground">
                  Wind energy priority affects load balancing during variable wind conditions.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="thresholds" className="space-y-6">
          <Card className="glow-red border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-primary neon-text">Storage Thresholds</CardTitle>
              <CardDescription>Configure battery storage optimization parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage Threshold</span>
                    <span className="text-primary font-medium">{storageThreshold[0]}%</span>
                  </div>
                  <Slider
                    value={storageThreshold}
                    onValueChange={setStorageThreshold}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Battery will start charging when renewable energy exceeds this threshold.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Charge Level</label>
                  <div className="text-2xl font-bold text-primary">20%</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Discharge Rate</label>
                  <div className="text-2xl font-bold text-primary">85%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Peak Efficiency",
                description: "Maximize overall system efficiency",
                icon: TrendingUp,
                color: "accent",
              },
              {
                name: "Cost Optimization",
                description: "Minimize operational costs",
                icon: Target,
                color: "secondary",
              },
              { name: "Green Priority", description: "Maximize renewable energy usage", icon: Zap, color: "chart-4" },
            ].map((scenario) => (
              <Card
                key={scenario.name}
                className={`glow border-${scenario.color}/20 bg-card/50 backdrop-blur cursor-pointer hover:scale-105 transition-transform`}
              >
                <CardHeader className="text-center">
                  <scenario.icon className={`w-8 h-8 mx-auto text-${scenario.color} mb-2`} />
                  <CardTitle className={`text-${scenario.color} neon-text`}>{scenario.name}</CardTitle>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-transparent" variant="outline">
                    Apply Scenario
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
