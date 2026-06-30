# FinTrack — Personal Financial Tracker

A full-stack-feeling, **fully client-side** personal finance tracker built with React. Track
multiple income sources and expenses/liabilities, import financial data with AI from PDFs,
screenshots or pasted text, and get a visual dashboard with disposable income, debt-to-income
ratio, and debt-free projections.

## Features

- **Multi-source income tracking** — salary, freelance, investment, rental and custom categories
- **Expense & liability tracking** — EMIs, jewel/personal loans, rent, utilities, groceries,
  subscriptions, with outstanding balance, interest rate and tenure
- **AI-powered import** — upload a PDF, drop/paste a screenshot, or paste raw text (bank SMS, UPI
  notifications, salary breakdowns). The app calls the Anthropic API (`claude-sonnet-4-6`) to
  extract structured line items, then shows an **editable review table** before saving.
- **Visual dashboard**
  - Income vs. expense donut charts (normalized to monthly equivalents)
  - Disposable income (with % of income)
  - Debt-to-Income ratio gauge (Healthy / Moderate / High Risk)
  - Debt liability summary table with auto-calculated total interest remaining
  - 6-month cash flow bar chart
  - Spending capacity & debt-free-date insights
- **Manual entry** forms for income and expenses
- **Dark / light mode**, responsive (mobile bottom-nav + desktop top-nav)
- **localStorage persistence** (key: `financial_tracker_data`) — no backend, no auth
- Toast notifications, delete confirmation dialogs, duplicate detection, empty states, INR
  formatting (₹1,00,000)

## Tech stack

- React 18 + Vite
- Tailwind CSS (with CSS-variable theming) + shadcn/ui-style components (vendored in `src/components/ui`)
- Recharts for charts
- lucide-react icons
- Anthropic API for document parsing

## Getting started

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
npm run preview  # preview the build
```

Open the printed local URL. Click **Load sample data** on the dashboard to explore instantly.

## AI import & the API key

The document parser posts the Anthropic Messages request body to a configurable endpoint:

- **Default / dev:** it calls `https://api.anthropic.com/v1/messages` directly (the API key is
  supplied by the runtime environment — no key in the browser).
- **Production (e.g. Vercel):** when `VITE_API_PROXY` is set (it defaults to `/api/parse` via
  `.env.production`), requests go through the serverless proxy in `api/parse.js`, which injects
  `ANTHROPIC_API_KEY` server-side. **The key is never shipped to the browser bundle.**

If the AI service is unreachable, every import method falls back gracefully with a retry button,
and you can always use the manual entry forms.

## Deploying to Vercel

1. Push this repo to GitHub (already done).
2. At [vercel.com](https://vercel.com) → **Add New… → Project** → import this repo. Vercel
   auto-detects the Vite framework (build `npm run build`, output `dist`); `vercel.json` pins this.
3. In **Project Settings → Environment Variables**, add:
   - `ANTHROPIC_API_KEY` = your Anthropic API key (scope: Production, and Preview if you want PR
     previews to parse). This is read only by the serverless function — never exposed to clients.
4. **Deploy.** The static app serves from `dist`; AI Import calls `/api/parse`, which proxies to
   Anthropic with your key.

> **Note on uploads:** Vercel serverless functions cap the request body at ~4.5 MB. Text paste and
> typical screenshots/single-page PDFs are well under that; very large files may exceed the proxy
> limit even though the in-app limit is 10 MB.

## Project structure

```
src/
├── components/
│   ├── Layout.jsx
│   ├── Dashboard/   (IncomeSummary, ExpenseSummary, FinancialHealth, CashFlowChart, SpendingInsight, DashboardPage)
│   ├── Income/      (IncomeList, IncomeForm)
│   ├── Expenses/    (ExpenseList, ExpenseForm)
│   ├── Import/      (ImportPage, PDFUploader, ImageUploader, TextInput, ReviewTable)
│   ├── shared/      (CategoryBadge, AmountDisplay, EmptyState)
│   └── ui/          (button, card, input, select, tabs, table, dialog, badge, progress, toast, ...)
├── hooks/           (useFinancialData, useDocumentParser)
├── utils/           (calculations, formatters, constants)
├── lib/utils.js
├── App.jsx
└── main.jsx
```
