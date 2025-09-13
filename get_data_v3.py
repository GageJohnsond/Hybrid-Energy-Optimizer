import requests
import pandas as pd  # For optional DataFrame processing
from gridstatus import Ercot  # Install with: pip install gridstatus if needed

# Step 1: Acquire ID Token
TOKEN_URL = "https://ercotb2c.b2clogin.com/ercotb2c.onmicrosoft.com/B2C_1_PUBAPI-ROPC-FLOW/oauth2/v2.0/token"
token_data = {
    "username": "tbowen8615@gmail.com",  # Replace
    "password": "Bandit3710Lado",   # Replace
    "grant_type": "password",
    "scope": "openid fec253ea-0d06-4272-a5e6-b478baeecd70 offline_access",
    "client_id": "fec253ea-0d06-4272-a5e6-b478baeecd70",
    "response_type": "id_token"
}
token_response = requests.post(TOKEN_URL, data=token_data)
id_token = token_response.json().get("id_token")

# Step 2: Set Headers and Endpoint for West Generation Summary (approximates Lubbock supply)
SUBSCRIPTION_KEY = "26b87f225a714f239f7daf0802603190"  # Replace
headers = {
    "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
    "Authorization": f"Bearer {id_token}"
}
GEN_URL = "https://api.ercot.com/api/public-reports/np3-910-er/2d_agg_gen_summary_west"
params = {
    "SCEDTimestampFrom": "2025-09-11T00:00:00",  # Start (ISO)
    "SCEDTimestampTo": "2025-09-13T23:59:59",    # End (ISO)
    "page": 1,                                   # Pagination
    "size": 100                                  # Results per page
}

# Step 3: Fetch West Gen Data
response = requests.get(GEN_URL, headers=headers, params=params)
if response.status_code == 200:
    data = response.json()
    # Print metadata and fields
    print("Fields:", data.get("fields", []))
    # Data rows (list of lists)
    rows = data.get("data", [])
    if rows:
        columns = [field['name'] for field in data.get("fields", [])]  # Extract column names
        df_gen = pd.DataFrame(rows, columns=columns)  # Convert to DataFrame with string columns
        # Extract relevant fuel columns
        fuel_cols = [col for col in df_gen.columns if "sumBasePoint" in col and any(f in col.lower() for f in ["coal", "gas", "hydro", "nuclear", "solar", "wind", "nonwgr", "wgr", "pvgr", "remres"])]
        print("West Gen Preview:")
        print(df_gen[fuel_cols].head())  # Preview gen by category
    else:
        print("No data rows found.")
else:
    print(f"Error: {response.status_code} - {response.text}")

# Step 4: Use gridstatus for today's fuel mix breakdowns (system-wide; scale for West if needed)
ercot = Ercot()
fuel_mix = ercot.get_fuel_mix("today")  # Use "today" for current day data
print("Fuel Mix Preview (Today's Data):")
print(fuel_mix.head())  # Columns: Time, Nuclear, Coal, Natural Gas, Wind, Solar, Hydro, etc.

# Alternative Step 4: Use EIA API for historical fuel mix
EIA_API_KEY = "i1eamKsKUoUMzkwKKw9EDcW5EXokmLj8mf9bA83m"  # Replace with real key from eia.gov
EIA_URL = "https://api.eia.gov/v2/electricity/rto/fuel-type-data/data/"
eia_params = {
    "api_key": EIA_API_KEY,
    "frequency": "hourly",
    "data[0]": "value",  # Fixed to array format
    "facets[respondent][]": "ERCO",  # Fixed facets
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
        # Pivot for fuel columns (handle if 'value' missing)
        if 'value' in df_eia.columns:
            df_eia_pivot = df_eia.pivot(index="period", columns="fueltype", values="value").reset_index()
            print("EIA Historical Fuel Mix Preview:")
            print(df_eia_pivot.head())
        else:
            print("No 'value' column in EIA data—check response.")
    else:
        print("No data in EIA response—check dates or key.")
else:
    print(f"EIA Error: {eia_response.status_code} - {eia_response.text}")