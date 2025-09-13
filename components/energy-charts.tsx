"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const powerData = [
  { time: "00:00", solar: 0, wind: 400, grid: 1200, total: 1600 },
  { time: "04:00", solar: 0, wind: 350, grid: 1100, total: 1450 },
  { time: "08:00", solar: 800, wind: 300, grid: 900, total: 2000 },
  { time: "12:00", solar: 1200, wind: 250, grid: 600, total: 2050 },
  { time: "16:00", solar: 900, wind: 400, grid: 700, total: 2000 },
  { time: "20:00", solar: 200, wind: 500, grid: 1000, total: 1700 },
  { time: "24:00", solar: 0, wind: 450, grid: 1150, total: 1600 },
]

const efficiencyData = [
  { name: "Solar", value: 35, color: "#f59e0b" },
  { name: "Wind", value: 25, color: "#ffffff" },
  { name: "Grid", value: 40, color: "#dc2626" },
]

const optimizationData = [
  { metric: "Load Balancing", current: 87, optimized: 94 },
  { metric: "Energy Storage", current: 76, optimized: 89 },
  { metric: "Grid Efficiency", current: 91, optimized: 96 },
  { metric: "Renewable Mix", current: 68, optimized: 78 },
]

export function EnergyCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Power Generation Over Time */}
      <Card className="glow border-accent/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-accent neon-text">Power Generation</CardTitle>
          <CardDescription>24-hour energy production timeline</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={powerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="#ffffff" />
              <YAxis stroke="#ffffff" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(43, 43, 43, 0.9)",
                  border: "1px solid rgba(0, 255, 204, 0.3)",
                  borderRadius: "8px",
                }}
              />
              <Area type="monotone" dataKey="solar" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
              <Area type="monotone" dataKey="wind" stackId="1" stroke="#ffffff" fill="#ffffff" fillOpacity={0.6} />
              <Area type="monotone" dataKey="grid" stackId="1" stroke="#dc2626" fill="#dc2626" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Energy Source Distribution */}
      <Card className="glow border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-primary neon-text">Energy Mix</CardTitle>
          <CardDescription>Current energy source distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={efficiencyData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {efficiencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(43, 43, 43, 0.9)",
                  border: "1px solid rgba(220, 38, 38, 0.3)",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {efficiencyData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm">
                  {item.name}: {item.value}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Potential */}
      <Card className="glow-yellow border-secondary/20 bg-card/50 backdrop-blur lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-secondary neon-text">Optimization Potential</CardTitle>
          <CardDescription>Current vs. optimized performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={optimizationData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" domain={[0, 100]} stroke="#ffffff" />
              <YAxis dataKey="metric" type="category" stroke="#ffffff" width={120} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(43, 43, 43, 0.9)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="current" fill="#dc2626" name="Current" />
              <Bar dataKey="optimized" fill="#00ffcc" name="Optimized" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
