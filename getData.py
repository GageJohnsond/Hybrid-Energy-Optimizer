import requests
import pandas as pd
from pulp import LpProblem, LpMinimize, LpVariable, lpSum, PULP_CBC_CMD, LpStatus
from gridstatus import Ercot
from datetime import datetime, timedelta

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
        "solar": latest_row.get("sumBasePointRemRes", 0),
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
        
        # Add petroleum capacity from "Other" category (estimate small portion)
        if 'Other' in latest_mix and latest_mix['Other'] > 0:
            available_capacity_mw['petroleum'] = latest_mix['Other'] * 0.5  # Assume 50% of "Other" is petroleum
    
    return available_capacity_mw

def get_west_zone_pricing(id_token, subscription_key):
    """Get real-time West zone pricing from ERCOT Settlement Point Prices API."""
    headers = {
        "Ocp-Apim-Subscription-Key": subscription_key,
        "Authorization": f"Bearer {id_token}"
    }
    
    # Settlement Point Prices API endpoint for Load Zones
    SPP_URL = "https://api.ercot.com/api/public-reports/np6-905-cd/spp_node_zone_hub"
    
    # Get current timestamp for recent pricing data
    current_time = datetime.now()
    start_time = current_time - timedelta(hours=2)  # Last 2 hours of data
    
    params = {
        "deliveryDateFrom": start_time.strftime("%Y-%m-%d"),
        "deliveryDateTo": current_time.strftime("%Y-%m-%d"),
        "settlementPointType": "LZ",  # Load Zone
        "settlementPoint": "LZ_WEST",  # Specifically request West Load Zone
        "page": 1,
        "size": 100
    }
    
    try:
        response = requests.get(SPP_URL, headers=headers, params=params)
        if response.status_code == 200:
            data = response.json()
            rows = data.get("data", [])
            fields = [f["name"] for f in data.get("fields", [])]
            
            if rows:
                df_spp = pd.DataFrame(rows, columns=fields)
                df_spp = df_spp.apply(pd.to_numeric, errors='coerce')
                
                # Check if we have settlement point price data
                if 'settlementPointPrice' in df_spp.columns:
                    # Filter for valid (non-NaN) prices
                    valid_prices = df_spp['settlementPointPrice'].dropna()
                    
                    if not valid_prices.empty:
                        # Get the most recent West zone price
                        latest_west_price = valid_prices.iloc[-1]
                        print(f"✅ Found West zone price: ${latest_west_price:.2f}/MWh")
                        return latest_west_price
                    else:
                        print("⚠️ No valid West zone pricing data found")
                        return None
                else:
                    print("⚠️ settlementPointPrice column not found in response")
                    print(f"📋 Available columns: {list(df_spp.columns)}")
                    return None
            else:
                print("⚠️ No settlement point pricing data returned")
                return None
        else:
            print(f"⚠️ Settlement Point Prices API Error: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"⚠️ Error fetching West zone pricing: {e}")
        return None

def get_all_fuel_costs(west_zone_price=None):
    
    # If we have real West zone pricing, use it as the base price and adjust fuel types accordingly
    if west_zone_price and west_zone_price > 0:
        print(f"\n💰 Using Real-Time West Zone Price: ${west_zone_price:.2f}/MWh")
        
        # Adjust fuel costs based on real market price
        # More expensive fuels cost more than market price, cheaper ones less
        base_price = west_zone_price
        default_costs = {
            'natural_gas': base_price * 1.0,    # Natural gas usually sets the marginal price
            'coal': base_price * 0.85,          # Coal is usually cheaper than market price
            'nuclear': base_price * 0.4,        # Nuclear is very cheap marginal cost
            'wind': base_price * 0.15,          # Wind has very low marginal cost
            'solar': base_price * 0.2,          # Solar has very low marginal cost  
            'hydro': base_price * 0.3,          # Hydro has low marginal cost
            'battery_storage': base_price * 1.3, # Storage includes efficiency losses
            'petroleum': base_price * 1.5       # Petroleum is typically most expensive
        }
        print("🔄 Fuel costs adjusted based on real-time West zone market price")
    else:
        print("🔧 Using default fuel costs (West zone pricing not available)")
    
    return default_costs

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

# Step 5: Get Real-Time West Zone Pricing
west_zone_price = get_west_zone_pricing(id_token, SUBSCRIPTION_KEY)

# Step 6: Set Costs using real-time West zone pricing if available
costs = get_all_fuel_costs(west_zone_price)

# Step 7: Use last known total generation as proxy for demand
estimated_demand_mw = sum(available_capacity_mw.values()) * 0.9  # assume 90% utilization

# Step 8: Run Optimization
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
        print(f"  {src.title():<12}: {val:.2f} MW @ ${costs[src]:.2f}/MWh = ${cost:.2f}")
    print(f"\n💰 Total Cost for 1 Hour = ${total_cost:.2f}")
else:
    print("❌ Optimization failed.")

