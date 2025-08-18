import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import StrategyHeatmap from './components/StrategyHeatmap';
import ScoreChart from './components/ScoreChart';
import ScoreHistoryTable from './components/ScoreHistoryTable';
import RegimeShiftAlert from './components/RegimeShiftAlert';
import MobileApp from './components/MobileApp';
import useMobileDetect from './hooks/useMobileDetect';

function App() {
  const [environment, setEnvironment] = useState('prod');
  const [marketData, setMarketData] = useState({});
  const [scoreHistory, setScoreHistory] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [currentRegime, setCurrentRegime] = useState(null);
  const [regimeShift, setRegimeShift] = useState(null);
  const [regimeShiftTime, setRegimeShiftTime] = useState(null);
  const [activeSection, setActiveSection] = useState('heatmap');
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isConnectingRef = useRef(false);
  const { isMobile } = useMobileDetect();

  const getWebSocketUrl = () => {
    if (environment === 'local') {
      return 'ws://localhost:8765';
    }
    
    // For production, check if we're on HTTPS
    if (window.location.protocol === 'https:') {
      // If HTTPS, we need WSS, but fallback to different approach if server doesn't support it
      console.warn('⚠️ HTTPS detected - WebSocket server needs SSL support');
      return 'wss://websocket.impviz.com'; // SSL-enabled WebSocket
    }
    
    return 'ws://websocket.impviz.com';
  };

  const websocketUrl = getWebSocketUrl();

  // Request notification permission on load
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const connect = () => {
      // Prevent multiple simultaneous connections
      if (isConnectingRef.current || (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)) {
        console.log('⚠️ Already connected or connecting, skipping');
        return;
      }

      isConnectingRef.current = true;

      // Clear any existing connection
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      console.log(`🔌 Connecting to ${websocketUrl}`);
      
      try {
        const ws = new WebSocket(websocketUrl);
        wsRef.current = ws;
        
        ws.onopen = () => {
          console.log('✅ Connected successfully!');
          isConnectingRef.current = false;
          setConnectionStatus('Connected');
          
          // Send initial request
          ws.send(JSON.stringify({ type: 'get_latest' }));
          
          // Set up periodic requests - store interval ID on the websocket
          ws.intervalId = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'get_latest' }));
            }
          }, 8000);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'pong') return;
            
            console.log('📦 Received data');
            setMarketData(data);
            setLastUpdate(new Date());
            
            // Check for regime changes
            if (data.data?.regime_by_market?.NQ !== undefined) {
              const newRegime = Math.floor(data.data.regime_by_market.NQ);
              const prevRegime = currentRegime;
              
              if (prevRegime !== null && newRegime !== prevRegime) {
                console.log(`🚨 REGIME SHIFT DETECTED: ${prevRegime} → ${newRegime}`);
                setRegimeShift({ from: prevRegime, to: newRegime });
                setRegimeShiftTime(new Date());
                
                // Browser notification
                if (Notification.permission === 'granted') {
                  const getRegimeName = (r) => r >= 2 ? 'BULLISH' : r >= 1 ? 'NEUTRAL' : 'BEARISH';
                  new Notification('🚨 REGIME SHIFT DETECTED!', {
                    body: `${getRegimeName(prevRegime)} (${prevRegime}) → ${getRegimeName(newRegime)} (${newRegime})`,
                    icon: '/favicon.ico'
                  });
                }
                
                // Clear the alert after 30 seconds
                setTimeout(() => {
                  setRegimeShift(null);
                }, 30000);
              }
              
              setCurrentRegime(newRegime);
            }
            
            // Update score from active_signals_score_by_market
            if (data.data?.active_signals_score_by_market?.NQ !== undefined) {
              const score = data.data.active_signals_score_by_market.NQ;
              
              setScoreHistory(prev => {
                const now = new Date();
                const lastEntry = prev[prev.length - 1];
                
                // Only add if at least 5 seconds have passed
                if (lastEntry && (now - lastEntry.timestamp) < 5000) {
                  return prev;
                }
                
                const newEntry = {
                  timestamp: now,
                  score: score,
                  longScore: 0,
                  shortScore: 0
                };
                
                const newHistory = [...prev, newEntry];
                
                // Keep only last 5 minutes
                const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);
                return newHistory.filter(item => item.timestamp > fiveMinutesAgo);
              });
            }
            
          } catch (error) {
            console.error('❌ Error processing data:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          isConnectingRef.current = false;
          setConnectionStatus('ERROR');
        };

        ws.onclose = (event) => {
          console.log('🔌 Connection closed:', event.code);
          isConnectingRef.current = false;
          setConnectionStatus('DISCONNECTED');
          
          // Clear interval if it exists
          if (ws.intervalId) {
            clearInterval(ws.intervalId);
          }
          
          // Reconnect after delay (unless normal close)
          if (event.code !== 1000) {
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, 3000);
          }
        };

      } catch (error) {
        console.error('❌ Failed to create WebSocket:', error);
        setConnectionStatus('ERROR');
      }
    };

    connect();

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        if (wsRef.current.intervalId) {
          clearInterval(wsRef.current.intervalId);
        }
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [websocketUrl, currentRegime]);

  const formatTime = (date) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString();
  };


  const renderMobileSection = () => {
    switch (activeSection) {
      case 'heatmap':
        return <StrategyHeatmap data={marketData} />;
      case 'chart':
        return (
          <ScoreChart 
            scoreHistory={scoreHistory} 
            onClearHistory={() => setScoreHistory([])}
          />
        );
      case 'history':
        return (
          <ScoreHistoryTable 
            scoreHistory={scoreHistory}
            regimeData={marketData.data?.regime_by_market}
          />
        );
      default:
        return <StrategyHeatmap data={marketData} />;
    }
  };

  // Use completely separate component for mobile to avoid CSS conflicts
  if (isMobile) {
    return (
      <MobileApp 
        connectionStatus={connectionStatus}
        lastUpdate={lastUpdate}
        currentRegime={currentRegime}
        marketData={marketData}
        scoreHistory={scoreHistory}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        renderMobileSection={renderMobileSection}
      />
    );
  }

  // Desktop version
  return (
    <div className="app">
      {/* Regime Shift Alert */}
      <RegimeShiftAlert 
        regimeShift={regimeShift} 
        regimeShiftTime={regimeShiftTime} 
      />
      
      <header className="app-header">
        <h1>ImpViz Active Trader</h1>
        <div className="connection-info">
          <div className={`status-indicator ${connectionStatus.toLowerCase()}`}>
            <span className="status-dot"></span>
            <span>{connectionStatus}</span>
          </div>
          <div className="last-update">
            Last Update: {formatTime(lastUpdate)}
          </div>
          <div className="current-regime">
            <span style={{ color: '#888' }}>Regime:</span>
            <span 
              style={{ 
                color: currentRegime >= 2 ? '#00ff88' : currentRegime >= 1 ? '#ffaa00' : '#ff4444',
                fontWeight: 'bold',
                marginLeft: '5px'
              }}
            >
              {currentRegime !== null ? currentRegime : '-'}
            </span>
          </div>
          <button 
            className="env-toggle"
            onClick={() => setEnvironment(env => env === 'prod' ? 'local' : 'prod')}
          >
            {environment === 'prod' ? 'Production' : 'Local'}
          </button>
        </div>
      </header>

      {/* Strategy Metrics Heatmap */}
      <StrategyHeatmap data={marketData} />

      {/* Score Trend Chart */}
      <ScoreChart 
        scoreHistory={scoreHistory} 
        onClearHistory={() => setScoreHistory([])}
      />

      {/* Score & Regime History Table */}
      <ScoreHistoryTable 
        scoreHistory={scoreHistory}
        regimeData={marketData.data?.regime_by_market}
      />
    </div>
  );
}

export default App;