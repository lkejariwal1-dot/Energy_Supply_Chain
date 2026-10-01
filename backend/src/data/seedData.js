// Seed / fallback data for the Energy Supply Chain Resilience API.
//
// This mirrors src/data/supplyChainData.js on the frontend exactly, so the
// API returns the same shapes the UI already renders in mock mode. It is
// used in two ways:
//   1. `npm run seed` writes it into the local SQLite file (see
//      scripts/seed.js), including recomputed corridor/route risk scores.
//   2. If the SQLite file can't be opened, src/config/db.js flips the app
//      into an in-memory mode that serves straight from this module, so
//      the server never crashes just because there's no database file.

export const corridors = [
  { id: 'hormuz', name: 'Strait of Hormuz', volumeShare: 44, risk: 98, trend: 'up' },
  { id: 'redsea', name: 'Red Sea / Bab-el-Mandeb', volumeShare: 7.6, risk: 40, trend: 'up' },
  { id: 'malacca', name: 'Strait of Malacca', volumeShare: 5.4, risk: 20, trend: 'flat' },
  { id: 'suez', name: 'Suez Canal', volumeShare: 5, risk: 28, trend: 'down' },
  { id: 'capegood', name: 'Cape of Good Hope', volumeShare: 38, risk: 14, trend: 'flat' }
]

export const riskTrend = [
  { day: 'Mon', hormuz: 72, redsea: 22, suez: 17 },
  { day: 'Tue', hormuz: 76, redsea: 25, suez: 19 },
  { day: 'Wed', hormuz: 81, redsea: 28, suez: 21 },
  { day: 'Thu', hormuz: 85, redsea: 31, suez: 23 },
  { day: 'Fri', hormuz: 89, redsea: 34, suez: 24 },
  { day: 'Sat', hormuz: 94, redsea: 37, suez: 26 },
  { day: 'Sun', hormuz: 98, redsea: 40, suez: 28 }
]

export const liveEvents = [
  {
    eventId: 1,
    time: 'Mar-26',
    severity: 'critical',
    source: 'AIS Feed',
    text: 'Strait of Hormuz Shutdown — Iran declares the strait closed and mines it triggering the largest oil supply disruption on record.'
  },
  {
    eventId: 2,
    time: 'February 28 2026',
    severity: 'critical',
    source: 'News Wire',
    text: 'US-Israeli Strike Kills Khamenei — A joint operation kills Supreme Leader Ali Khamenei and strikes Iranian military/nuclear targets.'
  },
  {
    eventId: 3,
    time: 'Jan-26',
    severity: 'critical',
    source: 'News Wire',
    text: 'US Captures Maduro in Venezuela — US airstrikes on Caracas and a special-operations raid seize President Nicolas Maduro.'
  },
  {
    eventId: 4,
    time: 'Sep-25',
    severity: 'high',
    source: 'Sanctions Feed',
    text: "Snapback Sanctions on Iran — Europe's E3 triggers the UN snapback mechanism reimposing all pre-2015 sanctions on Iran."
  },
  {
    eventId: 5,
    time: 'Jun-25',
    severity: 'critical',
    source: 'News Wire',
    text: 'Twelve-Day War: Israel Strikes Iran — Israel and the US strike Iranian nuclear facilities; Iran retaliates with 550+ ballistic missiles.'
  },
  {
    eventId: 6,
    time: 'Apr-25',
    severity: 'critical',
    source: 'Sanctions Feed',
    text: "Liberation Day Tariffs — Trump's sweeping reciprocal tariffs escalate the global trade war."
  }
]

export const scenarios = [
  {
    id: 'hormuz-closure',
    name: 'Hormuz full closure',
    description: 'Complete disruption of transit through the Strait of Hormuz for 14 days — the risk timeline already logs a "Strait of Hormuz Shutdown" event (Mar-26).',
    likelihood: 'Low',
    severity: 'Critical'
  },
  {
    id: 'redsea-suspension',
    name: 'Red Sea suspension',
    description: 'Extended rerouting around the Cape of Good Hope for all Red Sea-bound cargo.',
    likelihood: 'Medium',
    severity: 'High'
  },
  {
    id: 'sanctions-tightening',
    name: 'Iran sanctions tightening',
    description: 'Secondary sanctions enforcement removes remaining grey-market Iranian volumes.',
    likelihood: 'High',
    severity: 'Medium'
  },
  {
    id: 'opec-cut',
    name: 'OPEC+ supply cut',
    description: 'Coordinated production cut of 1.5 million bpd across OPEC+ members.',
    likelihood: 'Medium',
    severity: 'Medium'
  }
]

export const scenarioImpact = {
  'hormuz-closure': {
    scenarioId: 'hormuz-closure',
    priceImpact: '+34%',
    gdpImpact: '-1.8%',
    refiningImpact: '-61%',
    daysToStockout: 12,
    cascade: [
      { stage: 'Corridor', value: 100 },
      { stage: 'Refining throughput', value: 61 },
      { stage: 'Retail fuel supply', value: 44 },
      { stage: 'Industrial demand', value: 30 }
    ]
  },
  'redsea-suspension': {
    scenarioId: 'redsea-suspension',
    priceImpact: '+11%',
    gdpImpact: '-0.4%',
    refiningImpact: '-9%',
    daysToStockout: 28,
    cascade: [
      { stage: 'Corridor', value: 100 },
      { stage: 'Refining throughput', value: 91 },
      { stage: 'Retail fuel supply', value: 88 },
      { stage: 'Industrial demand', value: 85 }
    ]
  },
  'sanctions-tightening': {
    scenarioId: 'sanctions-tightening',
    priceImpact: '+6%',
    gdpImpact: '-0.2%',
    refiningImpact: '-4%',
    daysToStockout: 40,
    cascade: [
      { stage: 'Corridor', value: 100 },
      { stage: 'Refining throughput', value: 96 },
      { stage: 'Retail fuel supply', value: 94 },
      { stage: 'Industrial demand', value: 93 }
    ]
  },
  'opec-cut': {
    scenarioId: 'opec-cut',
    priceImpact: '+9%',
    gdpImpact: '-0.3%',
    refiningImpact: '-7%',
    daysToStockout: 32,
    cascade: [
      { stage: 'Corridor', value: 100 },
      { stage: 'Refining throughput', value: 93 },
      { stage: 'Retail fuel supply', value: 90 },
      { stage: 'Industrial demand', value: 89 }
    ]
  }
}

export const reserveSites = [
  { id: 'vizag', name: 'Visakhapatnam', capacity: 33.3, level: 71 },
  { id: 'mangalore', name: 'Mangalore', capacity: 18.3, level: 58 },
  { id: 'padur', name: 'Padur', capacity: 36.9, level: 84 }
]

export const drawdownSchedule = [
  { week: 'W1', projected: 11.7, optimized: 11.7 },
  { week: 'W2', projected: 9.8, optimized: 10.6 },
  { week: 'W3', projected: 7.9, optimized: 9.5 },
  { week: 'W4', projected: 6, optimized: 8.4 },
  { week: 'W5', projected: 4.2, optimized: 7.2 },
  { week: 'W6', projected: 2.3, optimized: 6.1 }
]

export const digitalTwinNodes = [
  { id: 'hormuz', label: 'Hormuz corridor', type: 'corridor', x: 18, y: 38, status: 'critical' },
  { id: 'redsea', label: 'Red Sea corridor', type: 'corridor', x: 30, y: 58, status: 'medium' },
  { id: 'malacca', label: 'Malacca corridor', type: 'corridor', x: 78, y: 46, status: 'low' },
  { id: 'jamnagar', label: 'Jamnagar refinery', type: 'refinery', x: 52, y: 40, status: 'medium' },
  { id: 'vizag_r', label: 'Vizag refinery', type: 'refinery', x: 66, y: 52, status: 'low' },
  { id: 'vizag', label: 'Vizag reserve', type: 'reserve', x: 70, y: 60, status: 'medium' },
  { id: 'mangalore', label: 'Mangalore reserve', type: 'reserve', x: 48, y: 58, status: 'medium' },
  { id: 'padur', label: 'Padur reserve', type: 'reserve', x: 44, y: 64, status: 'low' },
  { id: 'iraq', label: 'Iraq supplier', type: 'supplier', x: 8, y: 20, status: 'medium' },
  { id: 'saudi', label: 'Saudi supplier', type: 'supplier', x: 4, y: 40, status: 'medium' },
  { id: 'usgc', label: 'US Gulf Coast supplier', type: 'supplier', x: 92, y: 22, status: 'low' }
]

export const digitalTwinLinks = [
  { from: 'saudi', to: 'hormuz' },
  { from: 'iraq', to: 'hormuz' },
  { from: 'hormuz', to: 'jamnagar' },
  { from: 'redsea', to: 'jamnagar' },
  { from: 'jamnagar', to: 'mangalore' },
  { from: 'jamnagar', to: 'padur' },
  { from: 'malacca', to: 'vizag_r' },
  { from: 'vizag_r', to: 'vizag' },
  { from: 'usgc', to: 'malacca' }
]

export const procurementRecommendations = [
  {
    id: 'PR-1042',
    source: 'US Gulf Coast (WTI)',
    route: 'Cape of Good Hope',
    volume: '2.1M bbl',
    etaDays: 26,
    costDelta: '+$12.11/bbl',
    riskScore: 14,
    status: 'pending'
  },
  {
    id: 'PR-1043',
    source: 'Nigeria (Bonny Light)',
    route: 'Direct Atlantic',
    volume: '1.4M bbl',
    etaDays: 19,
    costDelta: '+$4.40/bbl',
    riskScore: 27,
    status: 'pending'
  },
  {
    id: 'PR-1044',
    source: 'UAE (Murban)',
    route: 'Hormuz (escorted convoy)',
    volume: '1.8M bbl',
    etaDays: 9,
    costDelta: '+$1.20/bbl',
    riskScore: 98,
    status: 'pending'
  },
  {
    id: 'PR-1045',
    source: 'Brazil (Tupi)',
    route: 'Direct Atlantic',
    volume: '900K bbl',
    etaDays: 24,
    costDelta: '+$5.80/bbl',
    riskScore: 9,
    status: 'approved'
  }
]

export const kpis = {
  globalRiskIndex: 54,
  daysOfCover: 11.7,
  activeAlerts: 6,
  pendingRecommendations: 3,
  affectedVolumeShare: 44
}
