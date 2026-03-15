import sys
import os
# Add the current directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'app')))

try:
    from app.utils.feature_engineering import extract_features
    from app.agents.portfolio_optimization import optimize_portfolio
    from app.agents.behavior_analysis import analyze_behavior
    print("Imports successful!")
except ImportError as e:
    print(f"Import failed: {e}")
    sys.exit(1)

# Mock Data
transactions = [
    {"type": "income", "amount": 50000, "date": "2026-03-01T10:00:00Z", "category": "salary"},
    {"type": "expense", "amount": 2000, "date": "2026-03-02T12:00:00Z", "category": "food"},
    {"type": "expense", "amount": 1500, "date": "2026-03-03T15:00:00Z", "category": "transport"},
]

def test_feature_engineering():
    print("Testing Feature Engineering...")
    features = extract_features(transactions, [], [])
    print(f"Features: {features}")
    assert features["monthly_income"] == 50000
    print("Feature Engineering: PASS")

def test_portfolio():
    print("Testing Portfolio Optimization...")
    p = optimize_portfolio("moderate", 10000, 1.0)
    print(f"Portfolio: {p}")
    assert abs(sum(p.values()) - 1.0) < 0.001
    print("Portfolio: PASS")

if __name__ == "__main__":
    test_feature_engineering()
    test_portfolio()
    print("\nAll unit tests passed!")
