def optimize_savings(features, predicted_expense, emergency_fund_months=6):
    income = features.get("monthly_income", 0)
    volatility = features.get("spending_volatility", 0)
    stability = features.get("income_stability", 1.0)
    
    # Calculate required safety buffer
    # More volatility or less stability = bigger buffer
    buffer_multiplier = (1 + (1 - stability)) * (1 + (volatility / max(1, predicted_expense)))
    
    safe_spending = predicted_expense * buffer_multiplier
    recommended_savings = max(0, income - safe_spending)
    
    # Check if emergency fund is adequate (simplified)
    # This would ideally check total account balance vs (predicted_expense * months)
    
    return {
        "recommended_monthly_investment": float(recommended_savings),
        "safety_buffer_ratio": float(buffer_multiplier)
    }
