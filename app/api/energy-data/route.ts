import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function GET() {
  try {
    // Run the Python script
    const pythonPath = path.join(process.cwd(), 'getData.py')

    const pythonProcess = spawn('python3', [pythonPath], {
      cwd: process.cwd(),
    })

    let stdout = ''
    let stderr = ''

    // Collect output
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    // Wait for process to complete
    const exitCode = await new Promise((resolve) => {
      pythonProcess.on('close', resolve)
    })

    if (exitCode !== 0) {
      console.error('Python script error:', stderr)
      return NextResponse.json(
        { error: 'Failed to fetch energy data', details: stderr },
        { status: 500 }
      )
    }

    // Parse the output to extract structured data
    const lines = stdout.split('\n')
    const result = {
      generationCapacity: {} as { [key: string]: number },
      fuelMix: [],
      optimization: {
        demand: 0,
        allocation: {} as { [key: string]: { mw: number, pricePerMWh: number, cost: number } },
        totalCost: 0,
        status: 'unknown' as 'optimal' | 'failed' | 'unknown'
      },
      rawOutput: stdout,
      timestamp: new Date().toISOString()
    }

    // Extract generation capacity
    let inCapacitySection = false
    for (const line of lines) {
      if (line.includes('Available West Generation Capacity (MW):')) {
        inCapacitySection = true
        continue
      }
      if (inCapacitySection && line.trim().includes(':')) {
        const match = line.match(/(\w+):\s+([\d.]+)/)
        if (match) {
          const [, source, capacity] = match
          result.generationCapacity[source.toLowerCase()] = parseFloat(capacity)
        }
      }
      if (line.includes('ERCOT Fuel Mix') || line.includes('EIA Historical')) {
        inCapacitySection = false
      }
    }

    // Extract optimization results
    let inOptimizationSection = false
    for (const line of lines) {
      if (line.includes('Optimal Energy Mix for')) {
        inOptimizationSection = true
        const demandMatch = line.match(/(\d+(?:\.\d+)?)\s*MW Demand/)
        if (demandMatch) {
          result.optimization.demand = parseFloat(demandMatch[1])
        }
        continue
      }
      if (inOptimizationSection && line.includes('MW @')) {
        const match = line.match(/(\w+)\s*:\s*([\d.]+)\s*MW\s*@\s*\$(\d+)\/MWh\s*=\s*\$([\d.]+)/)
        if (match) {
          const [, source, mw, price, cost] = match
          result.optimization.allocation[source.toLowerCase()] = {
            mw: parseFloat(mw),
            pricePerMWh: parseFloat(price),
            cost: parseFloat(cost)
          }
        }
      }
      if (line.includes('Total Cost for 1 Hour')) {
        const costMatch = line.match(/\$([\d.]+)/)
        if (costMatch) {
          result.optimization.totalCost = parseFloat(costMatch[1])
        }
        result.optimization.status = 'optimal'
      }
      if (line.includes('Optimization failed')) {
        result.optimization.status = 'failed'
        inOptimizationSection = false
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error running Python script:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}