'use client'

import { useState, useEffect } from 'react'

export interface EnergyCapacity {
  [source: string]: number
}

export interface OptimizationAllocation {
  mw: number
  pricePerMWh: number
  cost: number
}

export interface OptimizationResult {
  demand: number
  allocation: { [source: string]: OptimizationAllocation }
  totalCost: number
  status: 'optimal' | 'failed' | 'unknown'
}

export interface EnergyData {
  generationCapacity: EnergyCapacity
  fuelMix: any[]
  optimization: OptimizationResult
  rawOutput: string
  timestamp: string
}

export interface UseEnergyDataResult {
  data: EnergyData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useEnergyData(autoRefresh: boolean = false, refreshInterval: number = 300000): UseEnergyDataResult {
  const [data, setData] = useState<EnergyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEnergyData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/energy-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch energy data')
      console.error('Energy data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnergyData()
  }, [])

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchEnergyData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  return {
    data,
    loading,
    error,
    refetch: fetchEnergyData
  }
}