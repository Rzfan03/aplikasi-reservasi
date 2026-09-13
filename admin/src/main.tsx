import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './sentry'
import App from './App'
import { ingestFeLog } from './lib/api'
import 'sweetalert2/dist/sweetalert2.min.css'
import './index.css'

let lastFeReport = 0
function reportFe(level: 'warn' | 'error', message: string) {
  const now = Date.now()
  if (now - lastFeReport < 500) return
  lastFeReport = now
  void ingestFeLog(level, `[fe] ${message.slice(0, 1800)}`)
}

window.addEventListener('error', (e) => {
  const at = e.filename || location.pathname
  reportFe('error', `${e.message} (${at}:${e.lineno})`)
})
window.addEventListener('unhandledrejection', (e) => {
  const r = e.reason
  reportFe('error', `Unhandled: ${r instanceof Error ? r.message : String(r)}`)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)