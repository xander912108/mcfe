import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import CommunityLanding from './CommunityLanding.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/community" element={<CommunityLanding />} />
        <Route path="/connections" element={<App connectionsPage />} />
        <Route path="/leader" element={<App leaderMode />} />
        <Route path="/leader/entry" element={<App leaderMode leaderTab="entry" />} />
        <Route path="/leader/requests" element={<App leaderMode leaderTab="requests" />} />
        <Route path="/leader/connections" element={<App leaderMode leaderTab="connections" />} />
        <Route path="/leader/contribution" element={<App leaderMode leaderTab="contribution" />} />
        <Route path="/leader/monetization" element={<App leaderMode leaderTab="monetization" />} />
        <Route path="/leader/settings" element={<App leaderMode leaderTab="settings" />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
)
