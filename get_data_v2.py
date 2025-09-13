import requests
import pandas as pd  # For optional DataFrame processing
from gridstatus import Ercot  # Install with: pip install gridstatus if needed
import datetime

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

# Step 2: Set Headers and Endpoint for West Load Summary (approximates Lubbock demand)
SUBSCRIPTION_KEY = "26b87f225a714f239f7daf0802603190"  # Replace
headers = {
    "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
    "Authorization": f"Bearer {id_token}"
}
LOAD_URL = "https://api.ercot.com/api/public-reports/np3-910-er/2d_agg_load_summary_west"
params = {
    "SCEDTimestampFrom": "2025-09-11T00:00:00",  # Start (ISO)
    "SCEDTimestampTo": "2025-09-13T23:59:59",    # End (ISO)
    "page": 1,                                   # Pagination
    "size": 100                                  # Results per page
}

# Step 3: Fetch West Load Data
response = requests.get(LOAD_URL, headers=headers, params=params)
if response.status_code == 200:
    data = response.json()
    # Print metadata and fields
    print("Fields:", data.get("fields", []))
    # Data rows (list of lists)
    rows = data.get("data", [])
    if rows:
        columns = [field['name'] for field in data.get("fields", [])]  # Extract column names
        df_load = pd.DataFrame(rows, columns=columns)  # Convert to DataFrame with string columns
        # Extract relevant load columns (adjust based on actual fields, e.g., for total load)
        load_cols = [col for col in df_load.columns if "sum" in col.lower() and "load" in col.lower()]
        print("West Load Preview:")
        print(df_load[load_cols].head())  # Preview load data
    else:
        print("No data rows found.")
else:
    print(f"Error: {response.status_code} - {response.text}")

# Step 4: Use gridstatus for today's fuel mix breakdowns (system-wide; scale for West if needed)
ercot = Ercot()
fuel_mix = ercot.get_fuel_mix("today")  # Use "today" to avoid NotSupported error; or "latest" for real-time
print("Fuel Mix Preview (Today's Data):")
print(fuel_mix.head())  # Columns: Time, Nuclear, Coal, Natural Gas, Wind, Solar, Hydro, Power Storage, Other

# Alternative Step 4: Use EIA API for historical fuel mix (if gridstatus historical not needed)
EIA_API_KEY = "i1eamKsKUoUMzkwKKw9EDcW5EXokmLj8mf9bA83m"  # Replace with your free key from eia.gov
EIA_URL = "https://api.eia.gov/v2/electricity/rto/fuel-type-data/data/"
eia_params = {
    "api_key": EIA_API_KEY,
    "frequency": "hourly",
    "data": ["value"],
    "facets": {"respondent": ["ERCO"]},  # ERCOT
    "start": "2025-09-11T00",
    "end": "2025-09-13T23",
    "sort": [{"column": "period", "direction": "desc"}]
}
eia_response = requests.get(EIA_URL, params=eia_params)
if eia_response.status_code == 200:
    eia_data = eia_response.json()["response"]["data"]
    df_eia = pd.DataFrame(eia_data)
    # Pivot for fuel columns (e.g., 'fueltype' = 'NG' for natural gas, 'WND' wind, etc.)
    df_eia_pivot = df_eia.pivot(index="period", columns="fueltype", values="value").reset_index()
    print("EIA Historical Fuel Mix Preview:")
    print(df_eia_pivot.head())  # Columns: period (time), COL (coal), NG (nat gas), NUC (nuclear), SUN (solar), WAT (hydro), WND (wind), etc.
else:
    print(f"EIA Error: {eia_response.status_code} - {eia_response.text}")