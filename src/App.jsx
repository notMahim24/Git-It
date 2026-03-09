import React, { useState } from 'react';
import Layout from './components/Layout'
import LandingPage from './components/LandingPage'
import './App.css'

function App() {
  const [view, setView] = useState('landing');

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {view === 'landing' ? (
        <LandingPage onSelectMode={(mode) => setView(mode)} />
      ) : (
        <Layout mode={view} onBack={() => setView('landing')} />
      )}
    </div>
  )
}

export default App
