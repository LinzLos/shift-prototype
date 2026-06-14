import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Shell from './components/Shell'
import Overview from './screens/Overview'
import QueueMonitor from './screens/QueueMonitor'
import Loans from './screens/Loans'
import Simulation from './screens/Simulation'
import Roster from './screens/Roster'
import Performance from './screens/Performance'
import VizLab from './screens/VizLab'
import { QueueProvider } from './QueueContext'

export default function App() {
  return (
    <BrowserRouter>
      <QueueProvider>
        <Shell>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/queue-monitor" element={<QueueMonitor />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/roster" element={<Roster />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/viz-lab" element={<VizLab />} />
          </Routes>
        </Shell>
      </QueueProvider>
    </BrowserRouter>
  )
}