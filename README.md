# Purchase Savings Calculator

A SvelteKit savings planner that helps you figure out how much to invest monthly via recurring deposits (RD) to reach a future purchase goal — adjusted for inflation, FD loan coverage, and quarterly compounding.

## Features

- **Inflation-adjusted targets** — projects your purchase amount forward using a configurable inflation rate
- **FD loan coverage** — accounts for borrowing against your fixed deposit (default 85% loan ratio)
- **Monthly RD planning** — calculates exact and rounded-up monthly deposit amounts (nearest ₹1,000)
- **Quarterly compounding** — RD maturity uses `n = years × 4`, `i = rate ÷ 400`
- **Live KPI cards** — monthly investment, maturity amount, interest earned, effective compounding
- **TDS calculation** — Section 194A net maturity after tax (₹40k/₹50k threshold, 10%/20% rate, Form 15G/15H)
- **Interactive charts** — growth over time, amount comparison, principal vs interest breakdown
- **Maximizable charts** — expand any chart to fullscreen with tooltips on hover or tap
- **Calculation flowchart** — vertical step-by-step explanation of the full formula chain
- **Mobile-friendly** — responsive layout with no horizontal scrolling

## Tech Stack

- [SvelteKit](https://kit.svelte.dev/) with TypeScript
- [Tailwind CSS](https://tailwindcss.com/) v4 (forms + typography plugins)
- [Prettier](https://prettier.io/) for formatting
- Client-side only — no backend required

## Getting Started

```sh
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## Default Inputs

| Input | Default |
|-------|---------|
| Target amount | ₹2,00,000 |
| Years | 5 |
| Inflation rate | 8% |
| FD loan % | 85% |
| RD interest rate | 6.4% |

## Calculation Overview

1. **Inflation adjust** — `Target × (1 + rate)^years`
2. **FD coverage** — `Inflation Adjusted ÷ FD Loan %`
3. **Monthly savings** — divide by years × 12, round up to nearest ₹1,000
4. **RD maturity** — `M = R × [((1 + i)^n − 1) / (1 − (1 + i)^(−1/3))]`

Where `R` = monthly deposit, `n` = quarters, `i` = annual rate ÷ 400.

## TDS (Section 194A)

At RD maturity, interest is subject to TDS even on direct RD → FD rollover:

| Rule | Value |
|------|-------|
| FY interest threshold (non-senior) | ₹40,000 |
| FY interest threshold (senior citizen) | ₹50,000 |
| TDS rate (PAN linked) | 10% |
| TDS rate (no PAN) | 20% |
| Form 15G / 15H submitted | Nil TDS |

`Net Maturity = Gross Maturity − (Interest × TDS rate)` when aggregate FY interest exceeds the threshold.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run check` | TypeScript and Svelte type checking |
| `npm run format` | Format code with Prettier |
| `npm run lint` | Check formatting |

## Project Structure

```
src/
├── lib/
│   ├── calculations/savings.ts   # Core math engine
│   ├── components/               # UI components and charts
│   └── utils/format.ts           # INR and percent formatting
└── routes/
    ├── +page.svelte              # Main calculator page
    ├── +layout.svelte            # App shell and fonts
    └── layout.css                # Global theme and animations
```