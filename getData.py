import requests
import pandas as pd
from pulp import LpProblem, LpMinimize, LpVariable, lpSum, PULP_CBC_CMD, LpStatus
from gridstatus import Ercot
from datetime import datetime, timedelta

def extract_all_generation_capacity(df_gen, fuel_mix_df):
    if df_gen is None or df_gen.empty:
        return {}
    
    latest_row = df_gen.iloc[-1]
    available_capacity_mw = {
        "natural_gas": latest_row.get("sumBasePointNonWGR", 0) * 0.7,
        "coal": latest_row.get("sumBasePointNonWGR", 0) * 0.3,
        "wind": latest_row.get("sumBasePointWGR", 0),
        "solar": latest_row.get("sumBasePointRemRes", 0),
    }
    
    if fuel_mix_df is not None and not fuel_mix_df.empty:
        latest_mix = fuel_mix_df.iloc[-1]
        if 'Nuclear' in latest_mix and latest_mix['Nuclear'] > 0:
            available_capacity_mw['nuclear'] = latest_mix['Nuclear'] * 1.2
        if 'Hydro' in latest_mix and latest_mix['Hydro'] > 0:
            available_capacity_mw['hydro'] = latest_mix['Hydro']
        if 'Power Storage' in latest_mix and latest_mix['Power Storage'] > 0:
            available_capacity_mw['battery_storage'] = latest_mix['Power Storage']
        if 'Other' in latest_mix and latest_mix['Other'] > 0:
            available_capacity_mw['petroleum'] = latest_mix['Other'] * 0.5
    
    return available_capacity_mw

def get_west_zone_pricing(id_token, subscription_key):
    headers = {"Ocp-Apim-Subscription-Key": subscription_key, "Authorization": f"Bearer {id_token}"}
    SPP_URL = "https://api.ercot.com/api/public-reports/np6-905-cd/spp_node_zone_hub"
    current_time = datetime.now()
    start_time = current_time - timedelta(hours=2)
    
    params = {
        "deliveryDateFrom": start_time.strftime("%Y-%m-%d"),
        "deliveryDateTo": current_time.strftime("%Y-%m-%d"),
        "settlementPointType": "LZ",
        "settlementPoint": "LZ_WEST",
        "page": 1, "size": 100
    }
    
    try:
        response = requests.get(SPP_URL, headers=headers, params=params)
        if response.status_code == 200:
            data = response.json()
            rows = data.get("data", [])
            if rows:
                fields = [f["name"] for f in data.get("fields", [])]
                df_spp = pd.DataFrame(rows, columns=fields)
                df_spp = df_spp.apply(pd.to_numeric, errors='coerce')
                if 'settlementPointPrice' in df_spp.columns:
                    valid_prices = df_spp['settlementPointPrice'].dropna()
                    if not valid_prices.empty:
                        return valid_prices.iloc[-1]
        return None
    except:
        return None

def get_all_fuel_costs(west_zone_price=None):
    if west_zone_price and west_zone_price > 0:
        base_price = west_zone_price
        return {
            'natural_gas': base_price * 1.0, 'coal': base_price * 0.85,
            'nuclear': base_price * 0.4, 'wind': base_price * 0.15,
            'solar': base_price * 0.2, 'hydro': base_price * 0.3,
            'battery_storage': base_price * 1.3, 'petroleum': base_price * 1.5
        }
    return {'natural_gas': 35, 'coal': 30, 'nuclear': 12, 'wind': 5, 'solar': 10, 'hydro': 10, 'battery_storage': 45, 'petroleum': 60}

def calculate_total_costs(operational_costs):
    infrastructure_costs = {'natural_gas': 20, 'coal': 37, 'nuclear': 80, 'wind': 45, 'solar': 35, 'hydro': 40, 'battery_storage': 100, 'petroleum': 40}
    total_costs = {fuel: operational_costs[fuel] + infrastructure_costs.get(fuel, 0) for fuel in operational_costs}
    return total_costs, infrastructure_costs

def optimize_energy_mix(available_capacity, costs, demand_mw):
    valid_capacity = {k: v for k, v in available_capacity.items() if v > 0}
    total_available = sum(valid_capacity.values())
    if total_available < demand_mw:
        demand_mw = total_available * 0.8
    
    prob = LpProblem("Energy_Mix_Optimization", LpMinimize)
    alloc = {fuel: LpVariable(f"Alloc_{fuel}", lowBound=0) for fuel in valid_capacity if fuel in costs}
    
    prob += lpSum(alloc[fuel] * costs[fuel] for fuel in alloc), "Total_Cost"
    prob += lpSum(alloc[fuel] for fuel in alloc) == demand_mw, "Meet_Demand"
    for fuel in alloc:
        prob += alloc[fuel] <= valid_capacity[fuel], f"Cap_{fuel}"
    
    status = prob.solve(PULP_CBC_CMD(msg=False))
    if LpStatus[status] == "Optimal":
        return prob, alloc, valid_capacity, demand_mw
    return None

# Main execution - everything runs exactly once
print("Starting optimization...")

# Get token
TOKEN_URL = "https://ercotb2c.b2clogin.com/ercotb2c.onmicrosoft.com/B2C_1_PUBAPI-ROPC-FLOW/oauth2/v2.0/token"
token_data = {"username": "tbowen8615@gmail.com", "password": "Bandit3710Lado", "grant_type": "password", "scope": "openid fec253ea-0d06-4272-a5e6-b478baeecd70 offline_access", "client_id": "fec253ea-0d06-4272-a5e6-b478baeecd70", "response_type": "id_token"}
token_response = requests.post(TOKEN_URL, data=token_data)
id_token = token_response.json().get("id_token")

# Get data
SUBSCRIPTION_KEY = "26b87f225a714f239f7daf0802603190"
headers = {"Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY, "Authorization": f"Bearer {id_token}"}
GEN_URL = "https://api.ercot.com/api/public-reports/np3-910-er/2d_agg_gen_summary_west"
params = {"SCEDTimestampFrom": "2025-09-11T00:00:00", "SCEDTimestampTo": "2025-09-13T23:59:59", "page": 1, "size": 100}

response = requests.get(GEN_URL, headers=headers, params=params)
if response.status_code != 200:
    print(f"Error: {response.status_code}")
    exit()

data = response.json()
df_gen = pd.DataFrame(data.get("data", []), columns=[f["name"] for f in data.get("fields", [])])
df_gen = df_gen.apply(pd.to_numeric, errors='coerce')

# Get fuel mix
ercot = Ercot()
fuel_mix_df = ercot.get_fuel_mix("today")
print("\n📊 ERCOT Fuel Mix:")
print(fuel_mix_df.head())

# Extract capacity
available_capacity_mw = extract_all_generation_capacity(df_gen, fuel_mix_df)
print("\n✅ Available Capacity (MW):")
for k, v in available_capacity_mw.items():
    print(f"  {k.title()}: {v:.2f}")

# Get pricing and costs
west_zone_price = get_west_zone_pricing(id_token, SUBSCRIPTION_KEY)
if west_zone_price:
    print(f"\n✅ West zone price: ${west_zone_price:.2f}/MWh")
else:
    print("\n⚠️ Using default costs")

operational_costs = get_all_fuel_costs(west_zone_price)
total_costs, infrastructure_costs = calculate_total_costs(operational_costs)

print(f"\n💡 Cost Breakdown ($/MWh):")
print(f"{'Fuel':<15} {'Operational':<12} {'Infrastructure':<14} {'Total':<10}")
print("-" * 55)
for fuel in operational_costs:
    op = operational_costs[fuel]
    infra = infrastructure_costs.get(fuel, 0)
    total = op + infra
    print(f"{fuel.replace('_', ' ').title():<15} ${op:<11.2f} ${infra:<13.2f} ${total:<9.2f}")

# Optimize
estimated_demand_mw = sum(available_capacity_mw.values()) * 0.9
result = optimize_energy_mix(available_capacity_mw, total_costs, estimated_demand_mw)

if result:
    prob, alloc, valid_capacity, actual_demand = result
    print(f"\n✅ Optimized Mix for {actual_demand:.0f} MW:")
    print(f"{'Fuel':<15} {'MW':<8} {'Util%':<6} {'Cost':<10}")
    print("-" * 45)
    
    total_cost = 0
    results = []
    for fuel in alloc:
        allocation = alloc[fuel].varValue
        if allocation > 0.01:
            fuel_cost = allocation * total_costs[fuel]
            utilization = (allocation / valid_capacity[fuel]) * 100
            results.append((fuel, allocation, utilization, fuel_cost))
            total_cost += fuel_cost
    
    results.sort(key=lambda x: x[1], reverse=True)
    for fuel, allocation, utilization, fuel_cost in results:
        print(f"{fuel.replace('_', ' ').title():<15} {allocation:<8.1f} {utilization:<6.1f} ${fuel_cost:<9.0f}")
    
    print(f"\nTotal Cost: ${total_cost:,.0f}/hour")
    print(f"Average: ${total_cost/actual_demand:.2f}/MWh")
else:
    print("Optimization failed")

print("\nDone.")