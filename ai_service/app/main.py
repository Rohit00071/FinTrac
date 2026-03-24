from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from app.utils.feature_engineering import extract_features
from app.agents.spending_prediction import predict_spending
from app.agents.portfolio_optimization import optimize_portfolio
from app.agents.behavior_analysis import analyze_behavior
from app.agents.savings_optimization import optimize_savings

app = FastAPI(title="FinTrac AI Service")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ai/analyze")
async def analyze_finances(data: Dict[str, Any] = Body(...)):
    transactions = data.get("transactions", [])
    accounts = data.get("accounts", [])
    budgets = data.get("budgets", [])
    risk_tolerance = data.get("risk_tolerance", "moderate")
    
    # 1. Feature Engineering
    features = extract_features(transactions, accounts, budgets)
    
    # 2. Run Agents
    prediction = predict_spending(transactions)
    behavior = analyze_behavior(transactions)
    portfolio = optimize_portfolio(
        risk_tolerance, 
        features.get("total_savings", 0), # Simplified
        features.get("income_stability", 1.0)
    )
    
    savings = optimize_savings(features, prediction["predicted_spending_30d"])
    
    # 3. Aggregate Results
    return {
        "insights": behavior["insights"],
        "warnings": behavior["warnings"],
        "recommendations": [
            f"Expected spending next 30 days: ₹{prediction['predicted_spending_30d']:.2f}",
            f"Recommended monthly investment: ₹{savings['recommended_monthly_investment']:.2f}"
        ],
        "portfolio_allocation": portfolio,
        "prediction_details": prediction,
        "daily_spending_limit": prediction["predicted_spending_30d"] / 30
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
