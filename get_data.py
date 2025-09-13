import requests
import pandas as pd  # For optional DataFrame processing

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

# Step 2: Set Headers and Endpoint
SUBSCRIPTION_KEY = "26b87f225a714f239f7daf0802603190"  # Replace
headers = {
    "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
    "Authorization": f"Bearer {id_token}"
}
GEN_URL = "https://api.ercot.com/api/public-reports/np3-910-er/2d_agg_gen_summary"  # For West: .../2d_agg_gen_summary_west
params = {
    "SCEDTimestampFrom": "2025-09-11T00:00:00",  # Start (ISO)
    "SCEDTimestampTo": "2025-09-13T23:59:59",    # End (ISO)
    "page": 1,                                   # Pagination
    "size": 100                                  # Results per page
}

# Step 3: Fetch Data
response = requests.get(GEN_URL, headers=headers, params=params)
if response.status_code == 200:
    data = response.json()
    # Print metadata and fields (includes fuel types like sumBasePointCoal, etc.)
    print("Fields:", data.get("fields", []))
    # Data rows (list of dicts with fuel values)
    rows = data.get("data", [])
    if rows:
        df = pd.DataFrame(rows)  # Convert to DataFrame for analysis
        # Extract relevant fuel columns (adjust based on actual fields)
        fuel_cols = [col for col in df.columns if "sumBasePoint" in col and any(f in col.lower() for f in ["coal", "gas", "hydro", "nuclear", "solar", "wind"])]
        print(df[fuel_cols].head())  # Preview fuel mix
    else:
        print("No data rows found.")
else:
    print(f"Error: {response.status_code} - {response.text}")