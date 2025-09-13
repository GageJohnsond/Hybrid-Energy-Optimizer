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
        columns = [field['name'] for field in data.get("fields", [])]  # Extract column names to fix TypeError
        df_load = pd.DataFrame(rows, columns=columns)  # Convert to DataFrame with string columns
        # Extract relevant load columns (adjust based on actual fields, e.g., for total load)
        load_cols = [col for col in df_load.columns if "sum" in col.lower() and "load" in col.lower()]
        print("West Load Preview:")
        print(df_load[load_cols].head())  # Preview load data
    else:
        print("No data rows found.")
else:
    print(f"Error: {response.status_code} - {response.text}")

# Step 4: Use gridstatus for system-wide fuel mix breakdowns (approximate for West by scaling if needed)
ercot = Ercot()
start_date = datetime.date(2025, 9, 11)
end_date = datetime.date(2025, 9, 13)  # Exclusive end, so up to Sep 12
fuel_dfs = []
for single_date in pd.date_range(start_date, end_date - datetime.timedelta(days=1), freq='D'):
    daily_mix = ercot.get_fuel_mix_detailed(date=single_date)  # Changed to detailed for historical support
    fuel_dfs.append(daily_mix)

fuel_mix = pd.concat(fuel_dfs, ignore_index=True)
print("Fuel Mix Preview:")
print(fuel_mix.head())  # Columns: Time, Nuclear, Coal, Natural Gas, Wind, Solar, Hydro, Power Storage, Other