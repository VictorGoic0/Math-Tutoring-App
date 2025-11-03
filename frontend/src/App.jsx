import { useState, useEffect } from 'react'

function App() {
  const [backendStatus, setBackendStatus] = useState('checking...')

  useEffect(() => {
    // Test backend connection
    const apiUrl = import.meta.env.VITE_API_URL
    fetch(`${apiUrl}/api/health`)
      .then(res => res.json())
      .then(data => {
        setBackendStatus(data.status === 'ok' ? '✅ Connected' : '❌ Error')
      })
      .catch(err => {
        setBackendStatus('❌ Connection failed')
        console.error('Backend connection error:', err)
      })
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>AI Math Tutor - Setup Complete</h1>
      <p>Frontend: ✅ Running</p>
      <p>Backend: {backendStatus}</p>
      <p>Check the console for any errors.</p>
    </div>
  )
}

export default App

