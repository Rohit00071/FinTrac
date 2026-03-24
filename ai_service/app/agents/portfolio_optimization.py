import numpy as np
from scipy.optimize import minimize

def optimize_portfolio(risk_tolerance, savings, income_stability):
    # Asset classes: Stocks, Bonds, Real Estate, Crypto, Cash
    # Example expected returns and covariance matrix (static for MVP)
    expected_returns = np.array([0.10, 0.04, 0.06, 0.15, 0.01])
    # Simplified diagonal covariance for example
    cov_matrix = np.diag([0.05, 0.01, 0.02, 0.15, 0.00]) 
    
    num_assets = len(expected_returns)
    
    # Target volatility index based on risk tolerance
    risk_map = {"conservative": 0.1, "moderate": 0.3, "aggressive": 0.6}
    target_risk = risk_map.get(risk_tolerance, 0.3)
    
    # Constraints: 
    # 1. Weights sum to 1
    # 2. Volatility (risk) must be below target_risk for conservative/moderate
    constraints = [{'type': 'eq', 'fun': lambda x: np.sum(x) - 1}]
    
    if risk_tolerance != "aggressive":
        constraints.append({
            'type': 'ineq', 
            'fun': lambda x: target_risk - np.sqrt(x.T @ cov_matrix @ x)
        })
    
    bounds = tuple((0, 1) for _ in range(num_assets))
    
    # If income is unstable, force more into cash/bonds
    if income_stability < 0.5:
        # Minimum 20% in Bonds, 10% in Cash
        bounds = ((0, 0.4), (0.2, 0.8), (0, 0.3), (0, 0.05), (0.1, 1.0))

    initial_guess = np.array([1/num_assets] * num_assets)
    
    # Objective: Minimize risk for a given return, or maximize Return/Risk ratio
    # Here: Minimize negative expected return (Maximize return) subject to risk constraint
    def objective(weights):
        return -(weights @ expected_returns)

    res = minimize(objective, initial_guess, method='SLSQP', bounds=bounds, constraints=constraints)
    
    weights = res.x if res.success else initial_guess
    
    return {
        "stocks": float(weights[0]),
        "bonds": float(weights[1]),
        "real_estate": float(weights[2]),
        "crypto": float(weights[3]),
        "cash": float(weights[4])
    }
