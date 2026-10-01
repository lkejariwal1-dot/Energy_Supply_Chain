# Data sources

`src/data/supplyChainData.js` is not hand-written mock data. It is **generated**
by `scripts/generate-supply-chain-data.mjs` from the six CSVs in `src/data/raw/`:

- `india_crude_oil_supply.csv`
- `historical_crude_oil_prices_monthly.csv`
- `geopolitical_risk_events_timeline.csv`
- `suppliers_infrastructure.csv`
- `ship_routing.csv`
- `crude_oil_strategic_reserves.csv`

## Regenerating

```
node scripts/generate-supply-chain-data.mjs
```

Run this any time you update a CSV in `src/data/raw/`. The generated
`supplyChainData.js` is checked in (so the app still runs without a build step),
but it should be treated as a build artifact, not hand-edited.

## What's sourced vs. derived

Every value in the generated file is annotated inline with a comment. In short:

| Export | Status |
|---|---|
| `reserveSites[].capacity` | **Sourced** — `crude_oil_strategic_reserves.csv` (Vizag/Mangalore/Padur ISPRL caverns) |
| `reserveSites[].level` | Illustrative — ISPRL doesn't publish live fill levels |
| `corridors[].volumeShare` (Hormuz, Cape of Good Hope) | **Sourced** — Iraq+Saudi+UAE and Russia shares of crude imports, `india_crude_oil_supply.csv` |
| `corridors[].volumeShare` (Red Sea, Malacca, Suez) | Derived — split of the remaining import share; no CSV tags shipments by chokepoint |
| `corridors[].risk` | Derived — scored from how often/recently each corridor is mentioned in `geopolitical_risk_events_timeline.csv` |
| `liveEvents` | **Sourced** — 6 most recent entries from `geopolitical_risk_events_timeline.csv` |
| `procurementRecommendations[2].etaDays` (UAE) | **Sourced** — Jebel Ali→Mumbai transit days, `ship_routing.csv` (R056), + a loading/escort buffer |
| `procurementRecommendations[0].costDelta` (US Gulf Coast) | **Sourced** — Oct-2025 US domestic benchmark (`historical_crude_oil_prices_monthly.csv`) vs. Indian Basket Monthly Avg for the same month (`india_crude_oil_supply.csv`) |
| `procurementRecommendations[1],[3]` (Nigeria, Brazil) | Estimated — no matching lane in the `ship_routing.csv` sample |
| `kpis.daysOfCover` | Derived — real reserve capacity × illustrative fill level ÷ real 2024 daily consumption |
| `kpis.*` (rest) | Derived by aggregating the arrays above |
| `scenarios` / `scenarioImpact` | Hypothetical, by design (the Scenario Modeller simulates events that haven't happened) — `daysToStockout` is anchored to the real computed `daysOfCover` |

The build script (`scripts/generate-supply-chain-data.mjs`) never throws on bad
input: missing files, unparseable rows/dates, or absent metrics all fall back
to a safe default and are logged as a warning (and included as a comment at
the top of the generated file if any occurred).
