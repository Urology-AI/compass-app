import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          fontFamily: 'monospace', padding: '2rem', color: '#f87171',
          background: '#080c14', minHeight: '100dvh'
        }}>
          <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#7d8ba4' }}>COMPASS — render error</div>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>
            {this.state.error.toString()}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
