import pandas as pd
import numpy as np
from datetime import datetime

def extract_features(transactions, accounts, budgets):
    if not transactions:
        return {}
    
    df = pd.DataFrame(transactions)
    df['date'] = pd.to_datetime(df['date'])
    df['amount'] = pd.to_numeric(df['amount'])
    
    # Basic aggregations
    income_df = df[df['type'] == 'income']
    expense_df = df[df['type'] == 'expense']
    
    monthly_income = income_df.resample('ME', on='date')['amount'].sum().mean() if not income_df.empty else 0
    monthly_expense = expense_df.resample('ME', on='date')['amount'].sum().mean() if not expense_df.empty else 0
    
    saving_rate = (monthly_income - monthly_expense) / monthly_income if monthly_income > 0 else 0
    
    # Volatility
    spending_volatility = expense_df.resample('ME', on='date')['amount'].sum().std() if not expense_df.empty else 0
    
    # Category Distribution
    category_dist = expense_df.groupby('category')['amount'].sum().to_dict() if not expense_df.empty else {}
    
    # Weekend spending ratio
    df['is_weekend'] = df['date'].dt.dayofweek >= 5
    weekend_spending = df[(df['type'] == 'expense') & (df['is_weekend'])]['amount'].sum()
    total_spending = expense_df['amount'].sum()
    weekend_spending_ratio = weekend_spending / total_spending if total_spending > 0 else 0
    
    # Income Stability (Coefficient of Variation)
    income_std = income_df.resample('ME', on='date')['amount'].sum().std() if not income_df.empty else 0
    income_stability = 1 - (income_std / monthly_income) if monthly_income > 0 else 1
    
    # Total Savings from Accounts
    total_savings = sum(acc.get('balance', 0) for acc in accounts) if accounts else 0
    
    return {
        "monthly_income": float(monthly_income),
        "monthly_expense": float(monthly_expense),
        "total_savings": float(total_savings),
        "saving_rate": float(saving_rate),
        "spending_volatility": float(spending_volatility) if not np.isnan(spending_volatility) else 0,
        "category_distribution": category_dist,
        "weekend_spending_ratio": float(weekend_spending_ratio),
        "income_stability": float(income_stability) if not np.isnan(income_stability) else 1
    }
