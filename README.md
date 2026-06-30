# Utkarsh's Savings Calculator

A SvelteKit savings calculator by **Utkarsh Gaikwad** — inflation-adjusted RD/SIP planning with shareable links. No database or backend required.

**Version:** 2.7.0

## What's new in 2.7.0

- **Step-Up SIP formulas in Calculation Flow** — "How It Works" now shows the correct iterative compounding formula (`Dₘ = min(Base + TopUp×⌊(m-1)/12⌋, Cap)`) and the proper monthly interest rate for Step-Up SIP instead of the standard SIP formula.
- **Step-Up schedule + sensitivity in export PDF** — The main report PDF now includes the Step-Up Schedule and Return Sensitivity table (schedule first, sensitivity second, then charts) for Step-Up SIP mode.
- **Compare PDF cleanup** — Step-Up schedule and sensitivity tables removed from the compare PDF; top-up/cap info bar now reads "Base SIP ₹{amount} + ₹{topUp}/yr top-up · capped at ₹{cap}/mo".

<details>
<summary>Previous (2.6.0)</summary>

- **Step-Up SIP on Compare page** — New settings panel for annual top-up amount and monthly cap. The compare page displays three cards (RD, SIP, Step-Up SIP) with a "Best" badge on the highest net-gain instrument. Gains comparison summaries for all pairs (SIP vs RD, Step-Up vs RD, Step-Up vs SIP).
- **Step-Up line on Growth Overlay chart** — Amber solid line for Step-Up SIP balance, plus a rose dashed Step-Up Principal line showing cumulative deposits. Legend and tooltip updated accordingly.
- **SIP vs RD excess removed from chart** — The tooltip delta row and bottom excess summary have been removed from the Growth Overlay chart (kept in the comparison card section below).
- **Comparison card refinements** — Each card now shows "Principal", "Net Gains" (gains − tax), and monthly deposit detail. Step-Up SIP card displays the top-up and cap information.

</details>

<details>
<summary>Previous (2.5.4)</summary>

- **Header branding** — Sticky nav shows "by Utkarsh Gaikwad" in the same cursive script and teal color as the Plan page hero, stacked above "Savings Calculator".
- **GitHub link** — Top-right header pill opens the project repo in a new tab; mobile menu includes a "View on GitHub" row.

</details>

<details>
<summary>Previous (2.5.3)</summary>

- **Goal templates removed** — The Plan page no longer shows preset goal cards (Car, Home, Wedding, etc.). Enter your own target, years, inflation, and rates directly.

</details>

<details>
<summary>Previous (2.5.2)</summary>

- **Chart typography fine-tune** — Axis labels, legend, and SIP excess subtext scaled down to `text-xs` / `text-[11px]` with `text-gray-400` so data lines stay dominant.
- **Subtitle contrast** — Chart description uses `text-xs text-gray-400` under the `text-xl` title.

</details>

<details>
<summary>Previous (2.5.1)</summary>

- **Medium Growth Overlay widget** — Chart is centered (`max-w-5xl`), fixed at 450px height, and self-contained with its own title, border, and shadow (no nested `ChartCard` on `/compare`).
- **Readable typography** — Axis labels stepped up to `text-sm` / `text-gray-500`; tooltip currency values use `text-base font-medium` with tabular monospace.
- **Balanced strokes** — RD/SIP lines at 3.5px with increased SVG padding so axis labels have room to breathe.

</details>

<details>
<summary>Previous (2.5.0)</summary>

- **Growth Overlay redesign** — Compare chart is data-first: hero RD/SIP lines with faint gradient fills, whisper-light grid and axis labels, no vertical grid, and a floating tooltip with colored indicators and tabular currency values.
- **Legend & summary** — Bottom-left legend and bottom-right SIP excess callout use cleaner typography hierarchy.

</details>

<details>
<summary>Previous (2.4.0)</summary>

- **RD vs SIP only** — Compare page no longer includes the All Instruments table (PPF, NSC, Debt MF). The app focuses on recurring deposit vs SIP planning and comparison.
- **Removed calculation modules** — `ppf`, `nsc`, `debtMf`, `govRates`, and `govSavings` are gone; `CompareResult` is now `{ rd, sip }` only.

</details>

<details>
<summary>Previous (2.3.4)</summary>

- **Forward/Reverse mode removed** — Plan page no longer has the Forward/Reverse toggle. Reverse calculation (budget → years) and the Monthly Budget field in Advanced Options are gone.
- **Share links** — URL params `m` and `bud` are no longer emitted. Legacy links with those params still load other fields correctly.

</details>

<details>
<summary>Previous (2.3.3)</summary>

- **PPF / NSC actual XIRR** — Compare table showed computed XIRR (not pinned rates). PPF and NSC modeled yearly lump-sum deposits with annual compounding at 7.10% / 7.7%.
- **Plan page** — Historical Presets section removed (Goal Templates only).

</details>

<details>
<summary>Previous (2.3.2)</summary>

- **Light mode in production** — Tailwind v4 was applying `dark:` styles from the visitor's OS dark-mode preference (`prefers-color-scheme`), causing dark hero banners and cards on Vercel even though the site is light-only. Fixed by switching Tailwind's `dark` variant to class-based (`.dark` on `<html>`) and setting `color-scheme: light only` in `src/routes/layout.css`.

</details>

<details>
<summary>Previous (2.3.1)</summary>

- **PDF export (double print fix)** — Print dialog no longer reopens after Cancel or Save. A `sessionStorage` guard in `src/lib/pdf/printFlow.ts` ensures `window.print()` runs at most once per report, even when the report page remounts in dev or HMR.

</details>

<details>
<summary>Previous (2.3.0)</summary>

- **Growth Overlay chart** — Taller card on `/compare` (chart occupies ~70% of card); tooltip stays inside bounds at the last data point; improved typography and aspect ratio (no stretched labels).
- **PDF export fixes** — Print dialog no longer requires double-cancel; after Save or Cancel, the report page dismisses the printing hint and shows "Back to Calculator".
- **Monte Carlo removed** — SIP outcome distribution simulation removed from `/analyze` (was causing UI freezes with large simulation counts).
- **Chart polish** — Smaller, consistent axis and legend font sizes across charts via shared theme tokens.

</details>

<details>
<summary>Previous (2.2.0)</summary>

- **Compare chart** — Growth Overlay tooltips (RD balance, SIP balance, point delta) and a persistent SIP vs RD excess callout.
- **Conservative SIP default** — Default SIP return is **10%** everywhere. Goal templates and historical presets no longer override to higher rates; the "Nifty 10Y avg" preset was removed.

</details>

## Routes

| Route | Description |
|-------|-------------|
| `/` | **Plan** — share link, calculator, key results |
| `/compare` | RD vs SIP cards and medium Growth Overlay widget (centered, snap tooltip) |
| `/analyze` | Charts, sensitivity tables, cashflow, CGT ledger |
| `/export` | Share link, CSV, PNG card, PDF report |

## Shareable links (compact, no backend)

Scenarios sync to the URL automatically. Only **non-default** values are included, keeping links short.

**Example (SIP path, non-default target/years/inflation):**

```
https://your-app.vercel.app/?p=sip&t=1000000&y=10&inf=9&fd=85
```

`sip` is omitted here because the default SIP return is 10%. To share a custom rate:

```
https://your-app.vercel.app/?p=sip&sip=12
```

| Param | Field |
|-------|-------|
| `p` | Path: `rd` or `sip` |
| `t` | Target amount |
| `y` | Years |
| `inf` | Inflation % |
| `fd` | FD loan % |
| `rd` | RD interest % |
| `sip` | SIP return % |
| `sc` | Senior citizen (0/1) |
| `pan` | Has PAN (0/1) |
| `g15` | Form 15G/15H (0/1) |
| `fy` | Other FY interest |
| `ls` | Lumpsum |
| `su` | Step-up % |

### Defaults

| Field | Default |
|-------|---------|
| Target | ₹2,00,000 |
| Years | 5 |
| Inflation | 8% |
| FD loan | 85% |
| RD rate | 6.4% |
| SIP return | 10% |
| Path | RD |

Default scenario = plain `/` with no query string.

Legacy `?s=<base64>` links from v2.0 still work.

## Getting Started

```sh
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run check` | TypeScript + Svelte check |
| `npm test` | Vitest unit tests |

## Deployment

Deploy to [Vercel](https://vercel.com/) with `adapter-vercel`. All calculations and sharing are client-side.