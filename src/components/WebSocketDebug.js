import React, { useState, useRef } from 'react';

const WebSocketDebug = () => {
  const [logs, setLogs] = useState([]);
  const [url, setUrl] = useState(window.location.protocol === 'https:' ? 'wss://websocket.impviz.com:8765' : 'ws://websocket.impviz.com:8765');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const connect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    addLog(`Attempting to connect to ${url}`, 'info');
    
    try {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        addLog('WebSocket connected successfully!', 'success');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        addLog(`Received: ${event.data.substring(0, 100)}...`, 'success');
      };

      ws.onerror = (error) => {
        addLog(`WebSocket error: ${error.message || 'Unknown error'}`, 'error');
      };

      ws.onclose = (event) => {
        addLog(`WebSocket closed: Code ${event.code}, Reason: ${event.reason}`, 'warning');
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (error) {
      addLog(`Failed to create WebSocket: ${error.message}`, 'error');
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  const sendTestMessage = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type: 'get_latest' });
      wsRef.current.send(message);
      addLog(`Sent: ${message}`, 'info');
    } else {
      addLog('Cannot send message - WebSocket not connected', 'error');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      width: '400px', 
      background: '#1a1f3a', 
      border: '1px solid #2a2f4a', 
      borderRadius: '8px', 
      padding: '15px',
      fontSize: '12px',
      maxHeight: '500px',
      overflow: 'auto',
      zIndex: 1000
    }}>
      <h3 style={{ color: '#00d4ff', marginBottom: '10px' }}>WebSocket Debug</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <input 
          value={url} 
          onChange={(e) => setUrl(e.target.value)}
          style={{
            width: '100%',
            padding: '5px',
            background: '#0a0e27',
            color: '#fff',
            border: '1px solid #2a2f4a',
            borderRadius: '4px'
          }}
        />
      </div>

      <div style={{ marginBottom: '10px', display: 'flex', gap: '5px' }}>
        <button onClick={connect} disabled={isConnected} style={{
          padding: '5px 10px',
          background: isConnected ? '#666' : '#00d4ff',
          color: isConnected ? '#ccc' : '#0a0e27',
          border: 'none',
          borderRadius: '4px',
          cursor: isConnected ? 'not-allowed' : 'pointer'
        }}>
          Connect
        </button>
        <button onClick={disconnect} disabled={!isConnected} style={{
          padding: '5px 10px',
          background: !isConnected ? '#666' : '#ff4444',
          color: !isConnected ? '#ccc' : '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: !isConnected ? 'not-allowed' : 'pointer'
        }}>
          Disconnect
        </button>
        <button onClick={sendTestMessage} disabled={!isConnected} style={{
          padding: '5px 10px',
          background: !isConnected ? '#666' : '#00ff88',
          color: !isConnected ? '#ccc' : '#0a0e27',
          border: 'none',
          borderRadius: '4px',
          cursor: !isConnected ? 'not-allowed' : 'pointer'
        }}>
          Send Test
        </button>
        <button onClick={clearLogs} style={{
          padding: '5px 10px',
          background: '#666',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Clear
        </button>
      </div>

      <div style={{ color: isConnected ? '#00ff88' : '#ff4444', marginBottom: '10px' }}>
        Status: {isConnected ? 'Connected' : 'Disconnected'}
      </div>

      <div style={{ 
        maxHeight: '300px', 
        overflow: 'auto',
        background: '#0a0e27',
        padding: '10px',
        borderRadius: '4px'
      }}>
        {logs.map((log, index) => (
          <div key={index} style={{ 
            color: log.type === 'error' ? '#ff4444' : 
                   log.type === 'success' ? '#00ff88' : 
                   log.type === 'warning' ? '#ff9900' : '#ccc',
            marginBottom: '2px'
          }}>
            [{log.timestamp}] {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WebSocketDebug;