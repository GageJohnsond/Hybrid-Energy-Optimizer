// File: my-app/lib/ercot-data.ts
// Real ERCOT data for Lubbock, TX from getData.py
// Last updated: 2025-09-14 03:03:16

export const lubbockERCOTData = {
  // Current energy mix based on ERCOT West Zone data
  currentEnergy: {
    naturalGas: 48.5,
    petroleum: 6.2, 
    coal: 8.1,
    nuclear: 18.3,
    wind: 15.4,
    solar: 2.8,
    hydro: 0.7
  },
  // Optimized energy mix from the optimization results
  optimizedEnergy: {
    naturalGas: 16.5,
    petroleum: 1.5,
    coal: 1.1, 
    nuclear: 8.6,
    wind: 69.8,
    solar: 2.0,
    hydro: 0.5
  },
  totalDemand: 2850, // MW for Lubbock metro area
  renewablePercent: 18.9,
  co2Intensity: 0.38
};