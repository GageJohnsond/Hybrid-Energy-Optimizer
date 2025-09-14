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
        "natural_gas": latest_row.get("sumBasePointNonWGR", 0) * 0.7,
        "coal": latest_row.get("sumBasePointNonWGR", 0) * 0.3,
        "wind": latest_row.get("sumBasePointWGR", 0),
        "solar": latest_row.get("sumBasePointRemRes", 0),
    }
    
    # Add additional fuel types from fuel mix data if available
    if fuel_mix_df is not None and not fuel_mix_df.empty:
        latest_mix = fuel_mix_df.iloc[-1]
        
        # Add nuclear capacity
        if 'Nuclear' in latest_mix and latest_mix['Nuclear'] > 0:
            available_capacity_mw['nuclear'] = latest_mix['Nuclear'] * 1.2
        
        # Add hydro capacity
        if 'Hydro' in latest_mix and latest_mix['Hydro'] > 0:
            available_capacity_mw['hydro'] = latest_mix['Hydro']
        
        # Add battery storage capacity
        if 'Power Storage' in latest_mix and latest_mix['Power Storage'] > 0:
            available_capacity_mw['battery_storage'] = latest_mix['Power Storage']
        
        # Add petroleum capacity from "Other" category
        if 'Other' in latest_mix and latest_mix['Other'] > 0:
            available_capacity_mw['petroleum'] = latest_mix['Other'] * 0.5
    
    return available_capacity_mw

def get_west_zone_pricing(id_token, subscription_key):
    """Get real-time West zone pricing from ERCOT Settlement Point Prices API."""
    headers = {
        "Ocp-Apim-Subscription-Key": subscription_key,
        "Authorization": f"Bearer {id_token}"
    }
    
    SPP_URL = "https://api.ercot.com/api/public-reports/np6-905-cd/spp_node_zone_hub"
    
    current_time = datetime.now()
    start_time = current_time - timedelta(hours=2)
    
    params = {
        "deliveryDateFrom": start_time.strftime("%Y-%m-%d"),
        "deliveryDateTo": current_time.strftime("%Y-%m-%d"),
        "settlementPointType": "LZ",
        "settlementPoint": "LZ_WEST",
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
                
                if 'settlementPointPrice' in df_spp.columns:
                    valid_prices = df_spp['settlementPointPrice'].dropna()
                    
                    if not valid_prices.empty:
                        latest_west_price = valid_prices.iloc[-1]
                        print(f"✅ Found West zone price: ${latest_west_price:.2f}/MWh")
                        return latest_west_price
                    else:
                        print("⚠️ No valid West zone pricing data found")
                        return None
                else:
                    print("⚠️ settlementPointPrice column not found in response")
                    return None
            else:
                print("⚠️ No settlement point pricing data returned")
                return None
        else:
            print(f"⚠️ Settlement Point Prices API Error: {response.status_code}")
            return None
    except Exception as e:
        print(f"⚠️ Error fetching West zone pricing: {e}")
        return None

def get_all_fuel_costs(west_zone_price=None):
    """Get costs for all energy types."""
    default_costs = {
        'natural_gas': 35,
        'coal': 30,
        'nuclear': 12,
        'wind': 5,
        'solar': 10,
        'hydro': 10,
        'battery_storage': 45,
        'petroleum': 60
    }
    
    if west_zone_price and west_zone_price > 0:
        print(f"💰 Using Real-Time West Zone Price: ${west_zone_price:.2f}/MWh")
        
        base_price = west_zone_price
        default_costs = {
            'natural_gas': base_price * 1.0,
            'coal': base_price * 0.85,
            'nuclear': base_price * 0.4,
            'wind': base_price * 0.15,
            'solar': base_price * 0.2,
            'hydro': base_price * 0.3,
            'battery_storage': base_price * 1.3,
            'petroleum': base_price * 1.5
        }
        print("🔄 Fuel costs adjusted based on real-time West zone market price")
    else:
        print("🔧 Using default fuel costs (West zone pricing not available)")
    
    return default_costs

def get_infrastructure_costs():
    """Get infrastructure costs for each energy type."""
    return {
        'natural_gas': 800,
        'coal': 3500,
        'nuclear': 6000,
        'wind': 1600,
        'solar': 1200,
        'hydro': 2500,
        'battery_storage': 1800,
        'petroleum': 900
    }

def calculate_total_costs(operational_costs, infrastructure_costs=None):
    """Calculate total costs including operational and infrastructure components."""
    
    realistic_infrastructure_costs = {
        'natural_gas': 20,
        'coal': 37,
        'nuclear': 80,
        'wind': 45,
        'solar': 35,
        'hydro': 40,
        'battery_storage': 100,
        'petroleum': 40
    }
    
    total_costs = {}
    
    for fuel_type in operational_costs:
        if fuel_type in realistic_infrastructure_costs:
            total_costs[fuel_type] = operational_costs[fuel_type] + realistic_infrastructure_costs[fuel_type]
        else:
            total_costs[fuel_type] = operational_costs[fuel_type]
    
    return total_costs, realistic_infrastructure_costs

def optimize_with_constraints(available_capacity, costs, demand_mw):
    """Enhanced optimization with realistic constraints."""
    if not available_capacity:
        print("❌ No capacity data available for optimization.")
        return None
    
    valid_capacity = {k: v for k, v in available_capacity.items() if v > 0}
    
    if not valid_capacity:
        print("❌ No valid capacity data for optimization.")
        return None
    
    total_available = sum(valid_capacity.values())
    if total_available < demand_mw:
        print(f"⚠️ Warning: Total available capacity ({total_available:.0f} MW) < Demand ({demand_mw:.0f} MW)")
        print("🔄 Adjusting demand to 80% of available capacity")
        demand_mw = total_available * 0.8
    
    prob = LpProblem("Energy_Mix_Optimization", LpMinimize)
    
    alloc = {}
    for fuel_type in valid_capacity:
        if fuel_type in costs:
            alloc[fuel_type] = LpVariable(f"Alloc_{fuel_type}", lowBound=0)
    
    if not alloc:
        print("❌ No matching cost data for available fuel types.")
        return None
    
    prob += lpSum(alloc[fuel_type] * costs[fuel_type] for fuel_type in alloc), "Total_Cost"
    prob += lpSum(alloc[fuel_type] for fuel_type in alloc) == demand_mw, "Meet_Demand"
    
    for fuel_type in alloc:
        prob += alloc[fuel_type] <= valid_capacity[fuel_type], f"Cap_{fuel_type}"
    
    status = prob.solve(PULP_CBC_CMD(msg=False))
    
    if LpStatus[status] == "Optimal":
        return prob, alloc, valid_capacity, demand_mw
    else:
        print(f"❌ Optimization failed with status: {LpStatus[status]}")
        return None

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

# Step 3: Get Fuel Mix
ercot = Ercot()
fuel_mix_df = ercot.get_fuel_mix("today")
print("\n📊 ERCOT Fuel Mix (Today's Snapshot):")
print(fuel_mix_df.head())

available_capacity_mw = extract_all_generation_capacity(df_gen, fuel_mix_df)
print("\n✅ Available West Generation Capacity (MW):")
for k, v in available_capacity_mw.items():
    print(f"  {k.title()}: {v:.2f}")

# Step 4: Get EIA Historical Prices
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

# Step 6: Calculate total costs including infrastructure
operational_costs = get_all_fuel_costs(west_zone_price)
infrastructure_costs = get_infrastructure_costs()
total_costs, realistic_infra_costs = calculate_total_costs(operational_costs, infrastructure_costs)

print(f"\n💡 Cost Breakdown ($/MWh):")
print(f"{'Fuel Type':<15} {'Operational':<12} {'Infrastructure':<14} {'Total':<10}")
print("-" * 55)
for fuel_type in operational_costs:
    if fuel_type in total_costs and fuel_type in realistic_infra_costs:
        op_cost = operational_costs[fuel_type]
        infra_cost = realistic_infra_costs[fuel_type] 
        total_cost = op_cost + infra_cost
        print(f"{fuel_type.replace('_', ' ').title():<15} "
              f"${op_cost:<11.2f} "
              f"${infra_cost:<13.2f} "
              f"${total_cost:<9.2f}")

# Step 7: Calculate demand
estimated_demand_mw = sum(available_capacity_mw.values()) * 0.9

# Step 8: Run Optimization
optimization_result = optimize_with_constraints(available_capacity_mw, total_costs, estimated_demand_mw)

if optimization_result:
    prob, alloc, valid_capacity, actual_demand = optimization_result
    print(f"\n✅ Optimized Energy Mix for ~{actual_demand:.0f} MW Demand:")
    total_cost = 0
    total_generation = 0
    
    results = []
    for fuel_type in alloc:
        allocation = alloc[fuel_type].varValue
        if allocation > 0.01:
            operational_cost = operational_costs[fuel_type] * allocation
            infrastructure_component = realistic_infra_costs.get(fuel_type, 0) * allocation
            total_fuel_cost = allocation * total_costs[fuel_type]
            utilization = (allocation / valid_capacity[fuel_type]) * 100
            
            results.append({
                'fuel_type': fuel_type,
                'allocation': allocation,
                'operational_cost': operational_cost,
                'infrastructure_cost': infrastructure_component,
                'total_cost': total_fuel_cost,
                'utilization': utilization
            })
            
            total_cost += total_fuel_cost
            total_generation += allocation
    
    results.sort(key=lambda x: x['allocation'], reverse=True)
    
    print(f"{'Fuel Type':<15} {'MW':<8} {'Util%':<6} {'Op Cost':<10} {'Infra Cost':<11} {'Total Cost':<10}")
    print("-" * 75)
    
    for result in results:
        print(f"{result['fuel_type'].replace('_', ' ').title():<15} "
              f"{result['allocation']:<8.1f} "
              f"{result['utilization']:<6.1f} "
              f"${result['operational_cost']:<9.0f} "
              f"${result['infrastructure_cost']:<10.0f} "
              f"${result['total_cost']:<9.0f}")
    
    print("=" * 75)
    print(f"{'Total':<15} {total_generation:<8.1f} {'--':<6} {'--':<10} {'--':<11} ${total_cost:<9.0f}")
    print(f"\n💰 Total Cost per Hour: ${total_cost:,.2f}")
    print(f"📊 Average Cost: ${total_cost/actual_demand:.2f}/MWh")
    
    renewable_pct = sum([r['allocation'] for r in results if r['fuel_type'] in ['wind', 'solar']]) / total_generation * 100
    baseload_pct = sum([r['allocation'] for r in results if r['fuel_type'] in ['nuclear', 'coal', 'hydro']]) / total_generation * 100
    
    print(f"\n🔋 Energy Mix Summary:")
    print(f"   Renewables (Wind + Solar): {renewable_pct:.1f}%")
    print(f"   Baseload (Nuclear + Coal + Hydro): {baseload_pct:.1f}%")
    print(f"   Dispatchable (Gas + Storage + Petroleum): {100 - renewable_pct - baseload_pct:.1f}%")
else:
    print("❌ Enhanced optimization failed.")