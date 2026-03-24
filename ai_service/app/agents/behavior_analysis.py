import pandas as pd
import numpy as np

def analyze_behavior(transactions):
    if not transactions:
        return {"insights": [], "warnings": []}

    df = pd.DataFrame(transactions)
    if df.empty:
        return {"insights": [], "warnings": []}

    # Ensure required columns exist with defaults
    if 'category' not in df.columns:
        df['category'] = 'other'
    else:
        df['category'] = df['category'].fillna('other')

    if 'description' not in df.columns:
        df['description'] = 'No description'
    else:
        df['description'] = df['description'].fillna('No description')

    df['date'] = pd.to_datetime(df['date'])
    df['amount'] = pd.to_numeric(df['amount'])
    
    expense_df = df[df['type'] == 'expense']
    if expense_df.empty:
        return {"insights": [], "warnings": []}
    
    insights = []
    warnings = []
    
    # 1. Detect Category Spikes
    current_month = expense_df[expense_df['date'].dt.month == datetime.now().month]
    prev_month = expense_df[expense_df['date'].dt.month == ((datetime.now().month - 1) % 12 or 12)]
    
    curr_cat = current_month.groupby('category')['amount'].sum()
    prev_cat = prev_month.groupby('category')['amount'].sum()
    
    for cat in curr_cat.index:
        if cat in prev_cat.index and prev_cat[cat] > 0:
            increase = (curr_cat[cat] - prev_cat[cat]) / prev_cat[cat]
            if increase > 0.2:
                insights.append(f"Your {cat} spending increased {increase:.0%} compared to last month.")
                if increase > 0.5:
                    warnings.append(f"Significant spike in {cat} expenses detected!")

    # 2. Weekend Spending Spikes
    expense_df['day_name'] = expense_df['date'].dt.day_name()
    avg_weekday = expense_df[expense_df['date'].dt.dayofweek < 5]['amount'].mean()
    avg_weekend = expense_df[expense_df['date'].dt.dayofweek >= 5]['amount'].mean()
    
    if avg_weekend > avg_weekday * 1.5:
        insights.append("Your spending on weekends is significantly higher than weekdays.")

    # 3. Anomaly Detection (Simple Z-score)
    mean_val = expense_df['amount'].mean()
    std_val = expense_df['amount'].std()
    if std_val > 0:
        anomalies = expense_df[expense_df['amount'] > mean_val + 3 * std_val]
        for _, row in anomalies.iterrows():
            warnings.append(f"Anomalous transaction detected: {row['description']} (₹{row['amount']})")

    return {
        "insights": insights,
        "warnings": warnings
    }

from datetime import datetime
