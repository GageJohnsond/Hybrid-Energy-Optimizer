import requests
import pandas as pd
from pulp import LpProblem, LpMinimize, LpVariable, lpSum, PULP_CBC_CMD, LpStatus
from gridstatus import Ercot

def extract_all_generation_capacity(df_gen, fuel_mix_df):
    """Extract all available generation capacity from ERCOT data and fuel mix."""
    if df_gen is None or df_gen.empty:
        return {}
    
    latest_row = df_gen.iloc[-1]
    
    # Start with your original capacity extraction
    available_capacity_mw = {
        "natural_gas": latest_row.get("sumBasePointNonWGR", 0) * 0.7,  # Assume 70% of NonWGR is natural gas
        "coal": latest_row.get("sumBasePointNonWGR", 0) * 0.3,  # Assume 30% of NonWGR is coal
        "wind": latest_row.get("sumBasePointWGR", 0),
        "solar": latest_row.get("sumBasePointRemRes", 0) * 0.8,  # Assume 80% of RemRes is solar
        "other": latest_row.get("sumBasePointRemRes", 0) * 0.2,  # Assume 20% of RemRes is other renewables
    }
    
    # Add additional fuel types from fuel mix data if available
    if fuel_mix_df is not None and not fuel_mix_df.empty:
        latest_mix = fuel_mix_df.iloc[-1]
        
        # Add nuclear capacity (estimate as 1.2x current generation)
        if 'Nuclear' in latest_mix and latest_mix['Nuclear'] > 0:
            available_capacity_mw['nuclear'] = latest_mix['Nuclear'] * 1.2
        
        # Add hydro capacity (estimate as current generation since it's often at capacity)
        if 'Hydro' in latest_mix and latest_mix['Hydro'] > 0:
            available_capacity_mw['hydro'] = latest_mix['Hydro']
        
        # Add battery storage capacity (estimate as current generation)
        if 'Power Storage' in latest_mix and latest_mix['Power Storage'] > 0:
            available_capacity_mw['battery_storage'] = latest_mix['Power Storage']
    
    return available_capacity_mw

def get_all_fuel_costs():
    """Get costs for all energy types ($/MWh)."""
    return {
        'natural_gas': 35,
        'coal': 30,
        'nuclear': 12,
        'wind': 5,
        'solar': 10,
        'hydro': 10,
        'battery_storage': 45,
        'other': 40
    }

# Step 1: Acquire ID Token from ERCOT
TOKEN_URL = "https://ercotb2c.b2clogin.com/ercotb2c.onmicrosoft.com/B2C_1_PUBAPI-ROPC-FLOW/oauth2/v2.0/token"
token_data = {
    "username": "tbowen8615@gmail.com",
    "password": "Bandit3710Lado",
    "grant_type": "password",
    "scope": "openid fec253ea-0d06-4272-a5e6-b478baeecd70 offline_access",
    "client_id": "fec253ea-0d06-4272-a5e6-b478baeecd70",
    "response_type": "id_token"
}
token_response = requests.post(TOKEN_URL, data=token_data)
id_token = token_response.json().get("id_token")

# Step 2: Get West Generation Summary
SUBSCRIPTION_KEY = "26b87f225a714f239f7daf0802603190"
headers = {
    "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
    "Authorization": f"Bearer {id_token}"
}
GEN_URL = "https://api.ercot.com/api/public-reports/np3-910-er/2d_agg_gen_summary_west"
params = {
    "SCEDTimestampFrom": "2025-09-11T00:00:00",
    "SCEDTimestampTo": "2025-09-13T23:59:59",
    "page": 1,
    "size": 100
}

response = requests.get(GEN_URL, headers=headers, params=params)
if response.status_code == 200:
    data = response.json()
    rows = data.get("data", [])
    fields = [f["name"] for f in data.get("fields", [])]
    if not rows:
        print("❌ No generation data returned.")
        exit()
    df_gen = pd.DataFrame(rows, columns=fields)
    df_gen = df_gen.apply(pd.to_numeric, errors='coerce')
    latest_row = df_gen.iloc[-1]
else:
    print(f"Error fetching generation data: {response.status_code} - {response.text}")
    exit()

# Step 3: Get Fuel Mix (System-wide) to Estimate Costs
ercot = Ercot()
fuel_mix_df = ercot.get_fuel_mix("today")
print("\n📊 ERCOT Fuel Mix (Today's Snapshot):")
print(fuel_mix_df.head())

# Extract all available capacity using both data sources
available_capacity_mw = extract_all_generation_capacity(df_gen, fuel_mix_df)
print("\n✅ Available West Generation Capacity (MW):")
for k, v in available_capacity_mw.items():
    print(f"  {k.title()}: {v:.2f}")

# Step 4: Get EIA Historical Prices to Estimate Costs
EIA_API_KEY = "i1eamKsKUoUMzkwKKw9EDcW5EXokmLj8mf9bA83m"
EIA_URL = "https://api.eia.gov/v2/electricity/rto/fuel-type-data/data/"
eia_params = {
    "api_key": EIA_API_KEY,
    "frequency": "hourly",
    "data[0]": "value",
    "facets[respondent][]": "ERCO",
    "start": "2025-09-11T00",
    "end": "2025-09-13T23",
    "sort[0][column]": "period",
    "sort[0][direction]": "desc"
}
eia_response = requests.get(EIA_URL, params=eia_params)
if eia_response.status_code == 200:
    eia_data = eia_response.json().get("response", {}).get("data", [])
    if eia_data:
        df_eia = pd.DataFrame(eia_data)
        if "value" in df_eia.columns:
            df_pivot = df_eia.pivot(index="period", columns="fueltype", values="value").reset_index()
            print("\n🧪 EIA Historical Fuel Mix:")
            print(df_pivot.head())
        else:
            print("⚠️ No 'value' column in EIA response.")
else:
    print(f"EIA Error: {eia_response.status_code} - {eia_response.text}")

# Step 5: Set Costs for all fuel types
costs = get_all_fuel_costs()

# Step 6: Use last known total generation as proxy for demand
estimated_demand_mw = sum(available_capacity_mw.values()) * 0.9  # assume 90% utilization

# Step 7: Run Optimization
prob = LpProblem("Optimal_West_Energy_Mix", LpMinimize)
alloc = {src: LpVariable(f"Alloc_{src}", lowBound=0) for src in available_capacity_mw}

# Objective
prob += lpSum(alloc[src] * costs[src] for src in alloc), "Total_Cost"

# Constraints
prob += lpSum(alloc[src] for src in alloc) == estimated_demand_mw, "Meet_Demand"
for src in alloc:
    prob += alloc[src] <= available_capacity_mw[src], f"Cap_{src}"

status = prob.solve(PULP_CBC_CMD(msg=False))

if LpStatus[status] == "Optimal":
    print(f"\n✅ Optimal Energy Mix for ~{estimated_demand_mw:.0f} MW Demand:")
    total_cost = 0
    for src in alloc:
        val = alloc[src].varValue
        cost = val * costs[src]
        total_cost += cost
        print(f"  {src.title():<12}: {val:.2f} MW @ ${costs[src]}/MWh = ${cost:.2f}")
    print(f"\n💰 Total Cost for 1 Hour = ${total_cost:.2f}")
else:
    print("❌ Optimization failed.")
