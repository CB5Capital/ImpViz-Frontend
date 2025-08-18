import React from 'react';

const MobileApp = ({ 
  connectionStatus, 
  lastUpdate, 
  currentRegime, 
  marketData, 
  scoreHistory, 
  activeSection, 
  setActiveSection,
  renderMobileSection 
}) => {
  const formatTime = (date) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString();
  };

  const mobileStyles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      backgroundColor: '#0a0e27',
      color: '#ffffff',
      fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace",
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },
    header: {
      padding: '10px',
      borderBottom: '1px solid #1a1f3a',
      backgroundColor: '#0f1433',
      flexShrink: 0
    },
    title: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#00d4ff',
      textAlign: 'center',
      margin: '5px 0'
    },
    statusBar: {
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      fontSize: '11px',
      marginTop: '8px'
    },
    content: {
      flex: 1,
      overflow: 'auto',
      padding: '10px',
      paddingBottom: '70px'
    },
    nav: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '50px',
      backgroundColor: '#0a0e27',
      borderTop: '1px solid #1a1f3a',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 1000
    },
    navButton: {
      background: 'transparent',
      border: 'none',
      color: '#666',
      fontSize: '12px',
      padding: '10px',
      cursor: 'pointer',
      textTransform: 'uppercase'
    },
    navButtonActive: {
      color: '#00d4ff'
    },
    statusDot: {
      display: 'inline-block',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      marginRight: '5px',
      backgroundColor: connectionStatus === 'Connected' ? '#00ff88' : '#ff4444'
    },
    debugInfo: {
      padding: '20px',
      textAlign: 'center',
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: '8px',
      margin: '10px'
    }
  };

  return (
    <div style={mobileStyles.container}>
      <div style={mobileStyles.header}>
        <h1 style={mobileStyles.title}>ImpViz Active Trader 📱</h1>
        <div style={mobileStyles.statusBar}>
          <div>
            <span style={mobileStyles.statusDot}></span>
            <span>{connectionStatus}</span>
          </div>
          <div>
            <span style={{ color: '#888' }}>Regime: </span>
            <span style={{ 
              color: currentRegime >= 2 ? '#00ff88' : currentRegime >= 1 ? '#ffaa00' : '#ff4444',
              fontWeight: 'bold'
            }}>
              {currentRegime !== null ? currentRegime : '-'}
            </span>
          </div>
          <div style={{ color: '#666', fontSize: '10px' }}>
            {formatTime(lastUpdate)}
          </div>
        </div>
      </div>

      <div style={mobileStyles.content}>
        {!marketData?.data ? (
          <div style={mobileStyles.debugInfo}>
            <h3>📱 Mobile View Active</h3>
            <p>Connection Status: {connectionStatus}</p>
            <p>Waiting for market data...</p>
            <p style={{ fontSize: '10px', color: '#666', marginTop: '10px' }}>
              Screen: {window.innerWidth}x{window.innerHeight}
            </p>
            <p style={{ fontSize: '10px', color: '#666' }}>
              User Agent: Mobile Detected
            </p>
          </div>
        ) : (
          <div>
            {renderMobileSection()}
          </div>
        )}
      </div>

      <div style={mobileStyles.nav}>
        <button 
          style={{
            ...mobileStyles.navButton,
            ...(activeSection === 'heatmap' ? mobileStyles.navButtonActive : {})
          }}
          onClick={() => setActiveSection('heatmap')}
        >
          Heatmap
        </button>
        <button 
          style={{
            ...mobileStyles.navButton,
            ...(activeSection === 'chart' ? mobileStyles.navButtonActive : {})
          }}
          onClick={() => setActiveSection('chart')}
        >
          Chart
        </button>
        <button 
          style={{
            ...mobileStyles.navButton,
            ...(activeSection === 'history' ? mobileStyles.navButtonActive : {})
          }}
          onClick={() => setActiveSection('history')}
        >
          History
        </button>
      </div>
    </div>
  );
};

export default MobileApp;