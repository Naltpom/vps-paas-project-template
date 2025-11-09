import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState<any>(null);

  useEffect(() => {
    // Check backend API status
    fetch('/api')
      .then((res) => res.json())
      .then((data) => setApiStatus(data))
      .catch((err) => console.error('API Error:', err));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>{{PROJECT_NAME}}</h1>
        <p>{{DESCRIPTION}}</p>

        <div style={{ marginTop: '2rem' }}>
          <h2>Backend Status:</h2>
          {apiStatus ? (
            <pre>{JSON.stringify(apiStatus, null, 2)}</pre>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        <div style={{ marginTop: '2rem' }}>
          <a href="/api" target="_blank" rel="noopener noreferrer">
            API Docs
          </a>
        </div>
      </header>
    </div>
  );
}

export default App;
