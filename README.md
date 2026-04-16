# FinTrac — Personal Finance Tracker

A cross-platform personal finance app built with React Native (Expo) and a Python AI service. Track transactions, manage budgets, set savings goals, and get AI-powered spending insights — all in one place.

---

## Features

- **Dashboard** — Overview of balances, income vs. expenses, and recent activity
- **Transactions** — Log income and expenses across multiple accounts with category tagging
- **Budgets** — Set monthly spending limits per category and track progress
- **Savings Goals** — Create goals with target amounts and deadlines; contribute directly from your accounts
- **Bills** — Track recurring and one-off bills with due date reminders
- **Accounts** — Manage cash, bank, credit card, and digital wallet accounts (with Indian bank & UPI support)
- **AI Agents**
  - **Spending Advisor** — Daily spending limits, weekly projections, and overspend alerts
  - **Investment Broker** — Portfolio allocation recommendations based on risk tolerance with optional auto-invest
  - **Behavior Analysis** — Spending pattern insights and warnings
  - **Savings Optimization** — Recommended monthly investment amounts derived from your financial data

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile / Web client | React Native + Expo (TypeScript) |
| Navigation | React Navigation v7 (stack + bottom tabs) |
| State / Data fetching | React Context + TanStack Query |
| Local storage | AsyncStorage |
| Backend server | Node.js + Express (TypeScript) |
| Database | PostgreSQL via Drizzle ORM |
| AI service | Python FastAPI + scikit-learn, Prophet, pandas |
| Deployment | Render (web service + managed Postgres) |

---

## Project Structure

```
├── client/               # React Native / Expo app
│   ├── components/       # Reusable UI components
│   ├── contexts/         # AuthContext, FinanceContext
│   ├── hooks/            # Custom hooks (theme, responsive, etc.)
│   ├── lib/              # Storage helpers, AI agent client, formatters
│   ├── navigation/       # Stack and tab navigators
│   ├── screens/          # All app screens
│   └── types/            # Shared TypeScript types
├── server/               # Express API server
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # Route registration + AI proxy
│   └── storage.ts        # DB access layer
├── ai_service/           # Python FastAPI AI microservice
│   └── app/
│       ├── agents/       # spending_prediction, portfolio_optimization, behavior_analysis, savings_optimization
│       ├── utils/        # Feature engineering
│       └── main.py       # FastAPI app entry point
├── shared/
│   └── schema.ts         # Drizzle ORM schema + Zod types
└── render.yaml           # Render deployment config
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- PostgreSQL (or use the Render free tier)
- Expo CLI (`npm install -g expo`)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/fintrack
AI_SERVICE_INTERNAL_URL=http://127.0.0.1:8000
EXPO_PUBLIC_AI_SERVICE_URL=http://localhost:5000/api
```

### 3. Set up the database

```bash
npm run db:push
```

### 4. Start the AI service

```bash
cd ai_service
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 5. Start the backend server

```bash
npm run server:dev
```

### 6. Start the Expo app

```bash
npm run expo:dev
```

Then scan the QR code with Expo Go (iOS/Android) or open in a browser.

---

## AI Service API

The AI service runs on port `8000` and is proxied through the Express server at `/api/ai/*`.

### `POST /ai/analyze`

Analyzes financial data and returns insights, predictions, and portfolio recommendations.

**Request body:**
```json
{
  "transactions": [...],
  "accounts": [...],
  "budgets": [...],
  "risk_tolerance": "moderate"
}
```

**Response:**
```json
{
  "insights": [...],
  "warnings": [...],
  "recommendations": [...],
  "portfolio_allocation": {...},
  "prediction_details": {...},
  "daily_spending_limit": 1234.56
}
```

---

## Deployment

The app is configured for [Render](https://render.com) via `render.yaml`:

- **fintrack-ai** — Python web service running the FastAPI AI microservice
- **fintrack-main** — Node.js web service serving the Express API + Expo web build
- **fintrack-db** — Managed PostgreSQL database

To deploy, connect the repository to Render and it will provision all three services automatically.

---

## Scripts

| Command | Description |
|---|---|
| `npm run expo:dev` | Start Expo dev server |
| `npm run server:dev` | Start Express server in dev mode |
| `npm run all:dev` | Start both Expo and Express concurrently |
| `npm run server:build` | Bundle Express server with esbuild |
| `npm run expo:web:build` | Export Expo app for web |
| `npm run db:push` | Push Drizzle schema to the database |
| `npm run lint` | Run ESLint |
| `npm run check:types` | TypeScript type check |
| `npm run format` | Format code with Prettier |

---

## License

MIT
