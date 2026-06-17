# Purchase Savings Calculator

A SvelteKit savings planner that helps you figure out how much to invest monthly via recurring deposits (RD) to reach a future purchase goal — adjusted for inflation, FD loan coverage, and quarterly compounding.

**Version:** 1.3.0

## Features

- **Inflation-adjusted targets** — projects your purchase amount forward using a configurable inflation rate
- **FD loan coverage** — accounts for borrowing against your fixed deposit (default 85% loan ratio)
- **Monthly RD planning** — calculates exact and rounded-up monthly deposit amounts (nearest ₹1,000)
- **Quarterly compounding** — RD maturity uses `n = years × 4`, `i = rate ÷ 400`
- **Live KPI cards** — monthly investment, maturity, interest, compounding; plus TDS deducted and net interest when tax applies
- **TDS calculation** — Section 194A net maturity after tax (₹40k/₹50k threshold, 10%/20% rate, Form 15G/15H)
- **Interactive charts** — growth over time, amount comparison, principal vs interest breakdown (custom SVG)
- **Maximizable charts** — expand any chart to fullscreen with tooltips on hover or tap
- **Calculation flowchart** — vertical step-by-step explanation including TDS deducted, net interest, and net maturity when applicable
- **PDF report export** — 3-page A4 report via browser print (Save as PDF); summary, charts, and calculation flow; no server-side PDF libraries
- **Mobile-friendly** — responsive layout with no horizontal scrolling

## Tech Stack

- [SvelteKit](https://kit.svelte.dev/) 2 + [Svelte](https://svelte.dev/) 5 with TypeScript
- [Tailwind CSS](https://tailwindcss.com/) v4 (forms + typography plugins)
- Custom SVG charts (no charting library)
- PDF via `window.print()` and print CSS (no Playwright, html2pdf, or Chromium on the server)
- [@sveltejs/adapter-vercel](https://svelte.dev/docs/kit/adapter-vercel) for deployment
- [Prettier](https://prettier.io/) for formatting

## Getting Started

```sh
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## PDF Export

1. Click **Export PDF Report** on the calculator page.
2. Report data is saved to `localStorage` and the app navigates to `/report?id=…` in the same tab (no pop-up required).
3. The report page loads fonts, then opens the browser print dialog.
4. Choose **Save as PDF** as the destination.

The report is three A4 pages:

1. Summary — inputs, TDS, and key results
2. Visual analysis — growth, comparison, and breakdown charts (stacked vertically)
3. Calculation flow — step-by-step breakdown with RD formula

Report data is cleared from `localStorage` after printing.

## Deployment

```sh
npm run build
```

Deploy to [Vercel](https://vercel.com/). The project uses `adapter-vercel` in `vite.config.ts`. No headless browser or server-side PDF generation is required.

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
│   ├── calculations/
│   │   ├── savings.ts          # RD math, inflation, monthly series
│   │   └── tds.ts              # Section 194A TDS logic
│   ├── components/             # UI, charts (SVG), PdfReport
│   ├── pdf/
│   │   ├── buildReportPayload.ts
│   │   ├── generatePdf.ts      # localStorage + navigate to /report
│   │   └── pdf-report.css      # A4 print styles
│   └── utils/format.ts         # INR and percent formatting
└── routes/
    ├── +page.svelte            # Main calculator + Export PDF button
    ├── +layout.svelte          # App shell and fonts
    ├── layout.css              # Global theme and animations
    └── report/                 # Client-only print page (ssr: false)
        ├── +page.svelte
        ├── +page.ts
        └── +layout.svelte
```