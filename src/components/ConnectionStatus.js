import React from 'react';

const ConnectionStatus = ({ status, lastUpdate, connectionAttempts, lastError, connectionState }) => {
  const isConnected = status === 'Connected';
  
  const formatTime = (date) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString();
  };

  const getConnectionStateText = (state) => {
    const stateNames = {
      [WebSocket.CONNECTING]: 'CONNECTING',
      [WebSocket.OPEN]: 'OPEN',
      [WebSocket.CLOSING]: 'CLOSING',
      [WebSocket.CLOSED]: 'CLOSED'
    };
    return stateNames[state] || 'UNKNOWN';
  };
  
  return (
    <div className="connection-status">
      <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
        <span className="status-dot"></span>
        <span>{status}</span>
        {connectionState !== undefined && (
          <span className="connection-state">({getConnectionStateText(connectionState)})</span>
        )}
      </div>
      <div className="connection-details">
        <div className="last-update">
          Last Update: {formatTime(lastUpdate)}
        </div>
        {connectionAttempts > 0 && !isConnected && (
          <div className="connection-attempts">
            Attempts: {connectionAttempts}
          </div>
        )}
        {lastError && (
          <div className="connection-error" title={lastError}>
            Error: {lastError.length > 50 ? lastError.substring(0, 50) + '...' : lastError}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;