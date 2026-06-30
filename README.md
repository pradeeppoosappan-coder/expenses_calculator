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

The document parser posts to `https://api.anthropic.com/v1/messages`. Per the app's design, **no
`Authorization` header is sent** — the API key is expected to be injected by the runtime
environment. If the AI service is unreachable, every import method falls back gracefully with a
retry button, and you can always use the manual entry forms.

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
