import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import RiskIntelligence from './pages/RiskIntelligence.jsx'
import ScenarioModeller from './pages/ScenarioModeller.jsx'
import DigitalTwin from './pages/DigitalTwin.jsx'
import ReserveOptimizer from './pages/ReserveOptimizer.jsx'
import ProcurementOrchestrator from './pages/ProcurementOrchestrator.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/risk-intelligence" element={<RiskIntelligence />} />
      <Route path="/scenario-modeller" element={<ScenarioModeller />} />
      <Route path="/digital-twin" element={<DigitalTwin />} />
      <Route path="/reserve-optimizer" element={<ReserveOptimizer />} />
      <Route path="/procurement" element={<ProcurementOrchestrator />} />
    </Routes>
  )
}
