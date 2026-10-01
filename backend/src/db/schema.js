// SQLite schema for the Energy Supply Chain Resilience API.
// Mirrors the field names of the original Mongo-backed API 1:1, so the
// JSON the API returns is unchanged for the frontend.

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS corridors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  volumeShare REAL NOT NULL,
  risk REAL NOT NULL,
  trend TEXT NOT NULL DEFAULT 'flat'
);

CREATE TABLE IF NOT EXISTS risk_trend (
  ord INTEGER PRIMARY KEY,
  day TEXT NOT NULL,
  hormuz REAL NOT NULL,
  redsea REAL NOT NULL,
  suez REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS live_events (
  eventId INTEGER PRIMARY KEY,
  time TEXT NOT NULL,
  severity TEXT NOT NULL,
  source TEXT NOT NULL,
  text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scenarios (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  likelihood TEXT NOT NULL,
  severity TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scenario_impacts (
  scenarioId TEXT PRIMARY KEY,
  priceImpact TEXT NOT NULL,
  gdpImpact TEXT NOT NULL,
  refiningImpact TEXT NOT NULL,
  daysToStockout INTEGER NOT NULL,
  cascade TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS reserve_sites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  capacity REAL NOT NULL,
  level REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS drawdown_schedule (
  ord INTEGER PRIMARY KEY,
  week TEXT NOT NULL,
  projected REAL NOT NULL,
  optimized REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS digital_twin_nodes (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  type TEXT NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS digital_twin_links (
  fromNode TEXT NOT NULL,
  toNode TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS procurement_recommendations (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  route TEXT NOT NULL,
  volume TEXT NOT NULL,
  etaDays INTEGER NOT NULL,
  costDelta TEXT NOT NULL,
  riskScore REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS kpis (
  singletonKey TEXT PRIMARY KEY DEFAULT 'kpis',
  globalRiskIndex REAL NOT NULL,
  daysOfCover REAL NOT NULL,
  activeAlerts INTEGER NOT NULL,
  pendingRecommendations INTEGER NOT NULL,
  affectedVolumeShare REAL NOT NULL
);

-- New: shipping routes with computed geopolitical-risk scores
-- (see src/services/riskScoringService.js).
CREATE TABLE IF NOT EXISTS routes (
  id TEXT PRIMARY KEY,
  originPort TEXT NOT NULL,
  originCountry TEXT NOT NULL,
  destPort TEXT NOT NULL,
  destCountry TEXT NOT NULL,
  distanceNm REAL NOT NULL,
  transitDays REAL NOT NULL,
  tradeLane TEXT NOT NULL,
  canalRoute TEXT NOT NULL,
  chokepoints TEXT NOT NULL DEFAULT '[]',
  riskScore REAL NOT NULL,
  riskLabel TEXT NOT NULL
);
`

export function initSchema(db) {
  db.exec(SCHEMA_SQL)
}
