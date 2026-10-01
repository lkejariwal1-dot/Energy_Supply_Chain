import axios from 'axios'
import * as supplyChainData from '../data/supplyChainData.js'

// Base client for the Express/Node backend.
// Set VITE_API_URL in .env to point at your deployed API, e.g. http://localhost:5000/api
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000
})

// When the backend isn't running yet, these calls fail silently and the app
// falls back to the bundled supply-chain data so the UI is always demoable.
// Controlled by VITE_USE_MOCK in .env: defaults to real API calls (with the
// bundled data as a safety-net fallback if the backend is unreachable). Set
// VITE_USE_MOCK=true to force pure mock mode with no network calls at all.
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

async function safeGet(path, fallback) {
  if (USE_MOCK) return fallback
  try {
    const { data } = await client.get(path)
    return data
  } catch (err) {
    console.warn(`API call to ${path} failed, using bundled supply-chain data.`, err.message)
    return fallback
  }
}

export const api = {
  getCorridors: () => safeGet('/risk/corridors', supplyChainData.corridors),
  getRiskTrend: () => safeGet('/risk/trend', supplyChainData.riskTrend),
  getLiveEvents: () => safeGet('/risk/events', supplyChainData.liveEvents),
  getScenarios: () => safeGet('/scenarios', supplyChainData.scenarios),
  getScenarioImpact: (id) => safeGet(`/scenarios/${id}/impact`, supplyChainData.scenarioImpact[id]),
  getReserveSites: () => safeGet('/reserves/sites', supplyChainData.reserveSites),
  getDrawdownSchedule: () => safeGet('/reserves/drawdown', supplyChainData.drawdownSchedule),
  getDigitalTwin: () => safeGet('/twin/state', { nodes: supplyChainData.digitalTwinNodes, links: supplyChainData.digitalTwinLinks }),
  getProcurementRecommendations: () => safeGet('/procurement/recommendations', supplyChainData.procurementRecommendations),
  getKpis: () => safeGet('/dashboard/kpis', supplyChainData.kpis),

  // Route Risk Checker — no bundled-data fallback since these are new,
  // backend-only endpoints (nothing to demo-fallback to offline).
  getRoutePorts: () => safeGet('/risk/ports', []),
  searchRoutes: (params) => safeGet(`/risk/routes?${new URLSearchParams(params).toString()}`, []),
  getRouteById: (id) => safeGet(`/risk/routes/${id}`, null),

  approveRecommendation: async (id) => {
    if (USE_MOCK) return { id, status: 'approved' }
    try {
      const { data } = await client.post(`/procurement/recommendations/${id}/approve`)
      return data
    } catch (err) {
      console.warn(`Approve request for ${id} failed, applying optimistic local update.`, err.message)
      return { id, status: 'approved', offline: true }
    }
  },
  rejectRecommendation: async (id) => {
    if (USE_MOCK) return { id, status: 'rejected' }
    try {
      const { data } = await client.post(`/procurement/recommendations/${id}/reject`)
      return data
    } catch (err) {
      console.warn(`Reject request for ${id} failed, applying optimistic local update.`, err.message)
      return { id, status: 'rejected', offline: true }
    }
  }
}

export default api
