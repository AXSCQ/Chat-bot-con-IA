import React from 'react'
import ChatWidget from './components/ChatWidget'

function App() {
  return (
    <div style={{ height: '100vh' }}>
      <ChatWidget apiUrl="http://localhost:3001" />
    </div>
  )
}

export default App 