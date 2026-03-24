import pandas as pd
from prophet import Prophet
import numpy as np

def predict_spending(transactions):
    if not transactions:
        return {"predicted_spending_30d": 0, "category_predictions": {}}

    df = pd.DataFrame(transactions)
    if 'category' not in df.columns:
        df['category'] = 'other'
    else:
        df['category'] = df['category'].fillna('other')

    df = df[df['type'] == 'expense']
    
    if df.empty or len(df) < 5:
        return {"predicted_spending_30d": 0, "category_predictions": {}}

    # Prepare data for Prophet
    df['ds'] = pd.to_datetime(df['date']).dt.tz_localize(None)
    df['y'] = pd.to_numeric(df['amount'])
    
    # Aggregating by day to handle multiple transactions on the same day
    daily_df = df.groupby('ds')['y'].sum().reset_index()

    try:
        m = Prophet(daily_seasonality=True)
        m.fit(daily_df)
        
        future = m.make_future_dataframe(periods=30)
        forecast = m.predict(future)
        
        # Get sum of next 30 days
        predicted_30d = forecast.tail(30)['yhat'].sum()
        
        # Simple category distribution based on historical weights
        total_hist = daily_df['y'].sum()
        cat_weights = df.groupby('category')['y'].sum() / total_hist
        cat_predictions = (cat_weights * predicted_30d).to_dict()

        return {
            "predicted_spending_30d": float(max(0, predicted_30d)),
            "category_predictions": cat_predictions
        }
    except Exception as e:
        print(f"Prediction error: {e}")
        return {"predicted_spending_30d": 0, "category_predictions": {}}
