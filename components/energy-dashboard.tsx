"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnergyMetrics } from "./energy-metrics"
import { EnergyCharts } from "./energy-charts"
import { SystemStatus } from "./system-status"
import { OptimizationControls } from "./optimization-controls"
import { Zap, Battery, Sun, Wind, Settings, Activity } from "lucide-react"

export function EnergyDashboard() {

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold neon-text text-accent mb-2">ENERGY NEXUS</h1>
          <p className="text-muted-foreground text-lg">Hybrid Energy Optimization System v2.1</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="glow text-accent border-accent">
            <Activity className="w-4 h-4 mr-2" />
            ONLINE
          </Badge>
          <Button variant="outline" size="icon" className="glow-yellow bg-transparent">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glow border-accent/20 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Output</CardTitle>
            <Zap className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent neon-text">2.4 MW</div>
            <p className="text-xs text-muted-foreground">+12% from last hour</p>
          </CardContent>
        </Card>

        <Card className="glow-red border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grid Load</CardTitle>
            <Battery className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary neon-text">1.8 MW</div>
            <p className="text-xs text-muted-foreground">-5% from peak</p>
          </CardContent>
        </Card>

        <Card className="glow-yellow border-secondary/20 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solar Input</CardTitle>
            <Sun className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary neon-text">1.2 MW</div>
            <p className="text-xs text-muted-foreground">Peak efficiency</p>
          </CardContent>
        </Card>

        <Card className="glow border-chart-4/20 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wind Input</CardTitle>
            <Wind className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4 neon-text">0.8 MW</div>
            <p className="text-xs text-muted-foreground">Moderate winds</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="optimization"
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            Optimization
          </TabsTrigger>
          <TabsTrigger
            value="systems"
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            Systems
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnergyMetrics />
            <SystemStatus />
          </div>
          <EnergyCharts />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <EnergyCharts />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnergyMetrics />
            <SystemStatus />
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <OptimizationControls />
        </TabsContent>

        <TabsContent value="systems" className="space-y-6">
          <SystemStatus />
        </TabsContent>
      </Tabs>
    </div>
  )
}
