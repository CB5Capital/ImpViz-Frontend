import React, { useState } from 'react';

const TestConnection = () => {
  const [status, setStatus] = useState('');
  const [messages, setMessages] = useState([]);
  
  const testConnection = (url) => {
    setStatus(`Testing ${url}...`);
    setMessages([]);
    
    try {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        setStatus(`✅ Connected to ${url}`);
        ws.send(JSON.stringify({ type: 'get_latest' }));
      };
      
      ws.onmessage = (event) => {
        setMessages(prev => [...prev, `Received: ${event.data.substring(0, 100)}...`]);
      };
      
      ws.onerror = (error) => {
        setStatus(`❌ Error connecting to ${url}`);
        console.error('Test connection error:', error);
      };
      
      ws.onclose = (event) => {
        setStatus(prev => prev + ` (Closed: ${event.code})`);
      };
      
      // Close after 5 seconds
      setTimeout(() => ws.close(), 5000);
    } catch (error) {
      setStatus(`❌ Failed to create WebSocket: ${error.message}`);
    }
  };
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: '#1a1f3a',
      padding: '15px',
      borderRadius: '8px',
      maxWidth: '400px',
      fontSize: '12px',
      zIndex: 1000
    }}>
      <h4 style={{ color: '#00d4ff', marginBottom: '10px' }}>Test WebSocket Connection</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={() => testConnection('ws://localhost:8765')}
          style={{
            padding: '5px 10px',
            marginRight: '5px',
            background: '#00d4ff',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Local
        </button>
        <button 
          onClick={() => testConnection('ws://134.209.184.5:8765')}
          style={{
            padding: '5px 10px',
            background: '#00ff88',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Production
        </button>
      </div>
      
      <div style={{ color: '#fff', marginBottom: '10px' }}>
        Status: {status}
      </div>
      
      <div style={{
        maxHeight: '150px',
        overflow: 'auto',
        background: '#0a0e27',
        padding: '10px',
        borderRadius: '4px'
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ color: '#00ff88', fontSize: '10px' }}>
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestConnection;