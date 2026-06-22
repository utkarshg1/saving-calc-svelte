# Utkarsh's Savings Calculator

A SvelteKit savings calculator by **Utkarsh Gaikwad** — inflation-adjusted RD/SIP planning with shareable links. No database or backend required.

**Version:** 2.3.4

## What's new in 2.3.4

- **Forward/Reverse mode removed** — Plan page no longer has the Forward/Reverse toggle. Reverse calculation (budget → years) and the Monthly Budget field in Advanced Options are gone.
- **Share links** — URL params `m` and `bud` are no longer emitted. Legacy links with those params still load other fields correctly.

<details>
<summary>Previous (2.3.3)</summary>

- **PPF / NSC actual XIRR** — Compare table shows computed XIRR again (not pinned rates). PPF and NSC model **yearly lump-sum deposits** with annual compounding at 7.10% / 7.7%; RD, SIP, and Debt MF remain monthly. Caption under All Instruments explains the deposit schedules.
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
| `/` | **Plan** — goal templates, CPI/RD presets, share link, calculator |
| `/compare` | RD vs SIP cards, Growth Overlay chart (tooltips), 5-instrument table |
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