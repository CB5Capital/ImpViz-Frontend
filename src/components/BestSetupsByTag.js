import React from 'react';

const BestSetupsByTag = ({ data, regimeShift, regimeShiftTime, currentRegime }) => {
  // Extract signals from the data
  const signalsData = data?.data?.signals_by_market;
  
  if (!signalsData) {
    return (
      <div className="best-setups-section">
        <h3>BEST SETUPS BY STRATEGY</h3>
        <div className="waiting-message">Waiting for data...</div>
      </div>
    );
  }

  // Collect ALL signals (not just active) and organize by TAG and DIRECTION
  // TAG mapping from backend (super_model.py lines 1179-1185):
  const signalsByTagAndDirection = {
    "Trend Following": { "Long": [], "Short": [] },
    "Mean Reversion": { "Long": [], "Short": [] },
    "Trend Reversal": { "Long": [], "Short": [] }
  };

  // Process all markets
  Object.entries(signalsData).forEach(([market, marketData]) => {
    if (marketData.signals) {
      marketData.signals.forEach(signal => {
        // Map setup name to TAG - need more precise matching
        let tag = null;
        
        // Check for exact patterns in setup names
        if (signal.setup_name) {
          if (signal.setup_name.includes("MACD") && signal.setup_name.includes("Convergence")) {
            tag = "Trend Following";
          } else if (signal.setup_name.includes("SMA") && signal.setup_name.includes("5/20") && 
                     signal.setup_name.includes("Counter")) {
            tag = "Trend Reversal";
          } else if (signal.setup_name.includes("SMA") && signal.setup_name.includes("5/20")) {
            tag = "Trend Following";
          } else if (signal.setup_name.includes("Williams") && 
                     (signal.setup_name.includes("1/99") || signal.setup_name.includes("10/90"))) {
            tag = "Mean Reversion";
          }
        }

        // Include ONLY ACTIVE signals
        if (tag && signal.direction && (signal.direction === 'Long' || signal.direction === 'Short') && signal.has_active_signal === 1) {
          signalsByTagAndDirection[tag][signal.direction].push({
            ...signal,
            market: market,
            // Add a flag to indicate if signal is active
            isActive: true
          });
        }
      });
    }
  });

  // Find best setup for each TAG and DIRECTION combination
  const bestSetupsByTagAndDirection = [];
  
  Object.entries(signalsByTagAndDirection).forEach(([tag, directions]) => {
    Object.entries(directions).forEach(([direction, signals]) => {
      if (signals.length > 0) {
        // Sort by overall performance metrics, not just active signal strength
        // Use: hit_rate * pnl_per_trade * (1 / avg_drawdown) * sample_size weight
        const sortedSignals = signals.sort((a, b) => {
          // Calculate composite score based on historical performance
          const hitRateA = a.hit_rate || 0;
          const hitRateB = b.hit_rate || 0;
          
          const pnlA = a.pnl_per_trade || 0;
          const pnlB = b.pnl_per_trade || 0;
          
          // Lower drawdown is better, so invert it
          const drawdownFactorA = a.avg_drawdown ? (1 / Math.abs(a.avg_drawdown)) : 0.1;
          const drawdownFactorB = b.avg_drawdown ? (1 / Math.abs(b.avg_drawdown)) : 0.1;
          
          // Sample size weight (more samples = more reliable)
          const sampleWeightA = Math.min(1, (a.sample_size || 0) / 100);
          const sampleWeightB = Math.min(1, (b.sample_size || 0) / 100);
          
          // Risk/reward ratio bonus
          const rrA = a.risk_reward_ratio || 1;
          const rrB = b.risk_reward_ratio || 1;
          
          // Composite score calculation
          const scoreA = hitRateA * pnlA * drawdownFactorA * sampleWeightA * rrA;
          const scoreB = hitRateB * pnlB * drawdownFactorB * sampleWeightB * rrB;
          
          return scoreB - scoreA;
        });
        
        const bestSetup = sortedSignals[0];
        bestSetupsByTagAndDirection.push({
          tag: tag,
          direction: direction,
          setup: bestSetup,
          score: bestSetup.hit_rate * bestSetup.pnl_per_trade * (bestSetup.avg_drawdown ? (1 / Math.abs(bestSetup.avg_drawdown)) : 0.1) * Math.min(1, (bestSetup.sample_size || 0) / 100)
        });
      }
    });
  });

  // Find the best overall ACTIVE strategy
  const activeSetups = bestSetupsByTagAndDirection.filter(item => item.setup.isActive);
  const bestOverallActiveSetup = activeSetups.length > 0 ? 
    activeSetups.reduce((best, current) => current.score > best.score ? current : best) : null;

  const getDirectionColor = (direction) => {
    return direction === 'Long' ? '#00ff88' : '#ff4444';
  };

  const getTagIcon = (tag) => {
    switch(tag) {
      case 'Trend Following': return '📈';
      case 'Mean Reversion': return '🔄';
      case 'Trend Reversal': return '🔀';
      default: return '📊';
    }
  };

  // Helper function to get regime name
  const getRegimeName = (regime) => {
    if (regime >= 2) return 'BULLISH';
    if (regime >= 1) return 'NEUTRAL';
    return 'BEARISH';
  };

  return (
    <div className="best-setups-section">
      {/* Breaking News Banner for Regime Shift */}
      {regimeShift && regimeShiftTime && (
        <div className="regime-shift-banner">
          <div className="breaking-news-content">
            <span className="breaking-news-label">⚡ REGIME SHIFT ALERT</span>
            <span className="breaking-news-text">
              {getRegimeName(regimeShift.from)} ({regimeShift.from}) → {getRegimeName(regimeShift.to)} ({regimeShift.to}) • 
              {regimeShiftTime.toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}

      {/* Breaking News Banner for Best Overall Active Strategy */}
      {bestOverallActiveSetup && (
        <div className="breaking-news-banner">
          <div className="breaking-news-content">
            <span className="breaking-news-label">🚨 BEST ACTIVE STRATEGY</span>
            <span className="breaking-news-text">
              {bestOverallActiveSetup.tag} {bestOverallActiveSetup.direction} • {bestOverallActiveSetup.setup.market} • 
              {(bestOverallActiveSetup.setup.hit_rate).toFixed(1)}% Hit Rate • ${bestOverallActiveSetup.setup.pnl_per_trade?.toFixed(0)} Avg P&L
            </span>
          </div>
        </div>
      )}

      <h3>🏆 BEST ACTIVE SETUPS BY STRATEGY</h3>
      
      {bestSetupsByTagAndDirection.length === 0 ? (
        <div className="no-active-setups">
          <p>No active setups currently</p>
        </div>
      ) : (
        <div className="best-setups-grid">
          {bestSetupsByTagAndDirection.map(({ tag, direction, setup }, index) => (
            <div key={`${tag}-${direction}`} className={`best-setup-card ${setup.isActive ? 'active-setup' : ''}`}>
              <div className="setup-header">
                <span className="tag-icon">{getTagIcon(tag)}</span>
                <span className="tag-name">{tag}</span>
                <span 
                  className="direction-badge"
                  style={{ backgroundColor: getDirectionColor(direction) }}
                >
                  {direction}
                </span>
                {setup.isActive && (
                  <span className="active-badge">🔥 ACTIVE</span>
                )}
              </div>
              
              <div className="setup-details">
                <div className="setup-name">
                  {setup.setup_name}
                </div>
                
                <div className="setup-market-timeframe">
                  <span className="market">{setup.market}</span>
                  <span className="timeframe">{setup.timeframe}</span>
                </div>
                
                <div className="setup-metrics">
                  <div className="metrics-row">
                    <div className="metric-item">
                      <span className="metric-label">Hit Rate</span>
                      <span className="metric-value">{(setup.hit_rate).toFixed(1)}%</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Avg P&L</span>
                      <span 
                        className="metric-value"
                        style={{ color: setup.pnl_per_trade > 0 ? '#00ff88' : '#ff4444' }}
                      >
                        ${setup.pnl_per_trade?.toFixed(0)}
                      </span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Samples</span>
                      <span className="metric-value">{setup.sample_size || 0}</span>
                    </div>
                  </div>
                  
                  <div className="metrics-row">
                    <div className="metric-item">
                      <span className="metric-label">Avg Duration</span>
                      <span className="metric-value">
                        {setup.avg_duration ? 
                          (setup.avg_duration < 60 ? 
                            `${setup.avg_duration.toFixed(0)}m` : 
                            `${(setup.avg_duration / 60).toFixed(1)}h`
                          ) : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Avg DD</span>
                      <span 
                        className="metric-value"
                        style={{ color: '#ff6666' }}
                      >
                        ${Math.abs(setup.avg_drawdown || 0).toFixed(0)}
                      </span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Current</span>
                      <span className="metric-value">
                        ${setup.current_price?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {setup.isActive && setup.signal_age_minutes && (
                  <div className="signal-status">
                    <div className="signal-age">
                      <span className="age-indicator">
                        Active for {setup.signal_age_minutes < 60 
                          ? `${setup.signal_age_minutes.toFixed(0)}m` 
                          : `${(setup.signal_age_minutes / 60).toFixed(1)}h`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <style jsx>{`
        .best-setups-section {
          margin-bottom: 20px;
          padding: 20px;
          background: rgba(26, 31, 58, 0.3);
          border-radius: 8px;
          border: 1px solid #1a1f3a;
        }

        .best-setups-section h3 {
          font-size: 14px;
          color: #00d4ff;
          text-transform: uppercase;
          margin-bottom: 15px;
          text-align: center;
        }

        /* Regime Shift Banner */
        .regime-shift-banner {
          background: linear-gradient(90deg, #ffaa00, #ffcc44, #ffaa00);
          border: 2px solid #ffcc44;
          border-radius: 8px;
          margin-bottom: 15px;
          padding: 12px;
          animation: regimeShiftGlow 2s ease-in-out infinite alternate;
          box-shadow: 0 0 20px rgba(255, 170, 0, 0.4);
          overflow: hidden;
          position: relative;
        }

        .regime-shift-banner::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: breakingNewsShine 3s ease-in-out infinite;
        }

        /* Breaking News Banner */
        .breaking-news-banner {
          background: linear-gradient(90deg, #ff4444, #ff6666, #ff4444);
          border: 2px solid #ff6666;
          border-radius: 8px;
          margin-bottom: 20px;
          padding: 12px;
          animation: breakingNewsGlow 2s ease-in-out infinite alternate;
          box-shadow: 0 0 20px rgba(255, 68, 68, 0.4);
          overflow: hidden;
          position: relative;
        }

        .breaking-news-banner::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: breakingNewsShine 3s ease-in-out infinite;
        }

        .breaking-news-content {
          display: flex;
          flex-direction: column;
          gap: 5px;
          position: relative;
          z-index: 1;
        }

        .breaking-news-label {
          font-size: 12px;
          font-weight: bold;
          color: #ffffff;
          text-transform: uppercase;
          text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
          animation: breakingNewsFlash 1.5s ease-in-out infinite;
        }

        .breaking-news-text {
          font-size: 11px;
          color: #ffffff;
          font-weight: bold;
          text-shadow: 0 0 2px rgba(0, 0, 0, 0.6);
        }

        .no-active-setups {
          text-align: center;
          color: #666;
          padding: 20px;
          font-size: 12px;
        }

        .best-setups-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 15px;
        }

        .best-setup-card {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 6px;
          padding: 15px;
          border: 1px solid #2a2f4a;
          transition: all 0.3s ease;
        }

        .best-setup-card:hover {
          background: rgba(0, 0, 0, 0.5);
          border-color: #00d4ff;
          transform: translateY(-2px);
        }

        /* Active setup styling - very prominent */
        .best-setup-card.active-setup {
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 212, 255, 0.15) 100%);
          border: 2px solid #00ff88;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
          animation: activeGlow 3s ease-in-out infinite alternate;
          transform: scale(1.02);
        }

        .best-setup-card.active-setup:hover {
          transform: scale(1.05);
          box-shadow: 0 0 25px rgba(0, 255, 136, 0.5);
        }

        .setup-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #2a2f4a;
          position: relative;
        }

        .direction-badge {
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
          color: #0a0e27;
          text-transform: uppercase;
        }

        .active-badge {
          margin-left: auto;
          background: linear-gradient(45deg, #00ff88, #00ff88, #ffffff);
          color: #0a0e27;
          padding: 4px 10px;
          border-radius: 15px;
          font-size: 10px;
          font-weight: bold;
          text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
          animation: activeBadgePulse 2s ease-in-out infinite;
          box-shadow: 0 0 10px rgba(0, 255, 136, 0.6);
        }

        .tag-icon {
          font-size: 20px;
        }

        .tag-name {
          font-size: 13px;
          font-weight: bold;
          color: #00d4ff;
          text-transform: uppercase;
        }

        .setup-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .setup-name {
          font-size: 12px;
          color: #fff;
          font-weight: bold;
        }

        .setup-market-direction {
          display: flex;
          gap: 10px;
          align-items: center;
          font-size: 11px;
        }

        .market {
          background: #1a1f3a;
          padding: 2px 6px;
          border-radius: 3px;
          color: #00d4ff;
        }

        .direction {
          font-weight: bold;
          text-transform: uppercase;
        }

        .timeframe {
          color: #999;
        }

        .setup-metrics {
          padding: 10px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .metrics-row {
          display: flex;
          justify-content: space-between;
          gap: 8px;
        }

        .metric-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }

        .metric-label {
          font-size: 9px;
          color: #666;
          text-transform: uppercase;
        }

        .metric-value {
          font-size: 12px;
          font-weight: bold;
          color: #fff;
        }


        .signal-status {
          margin-top: 10px;
          padding: 8px;
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 212, 255, 0.2) 100%);
          border: 1px solid rgba(0, 255, 136, 0.5);
          border-radius: 6px;
          text-align: center;
        }

        .signal-age {
          text-align: center;
          margin-top: 5px;
        }

        .age-indicator {
          font-size: 11px;
          color: #00ff88;
          background: rgba(0, 0, 0, 0.4);
          padding: 4px 12px;
          border-radius: 12px;
          font-weight: bold;
        }

        @keyframes activeGlow {
          0% { 
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
            border-color: #00ff88;
          }
          100% { 
            box-shadow: 0 0 30px rgba(0, 255, 136, 0.6);
            border-color: #00ffaa;
          }
        }

        @keyframes activeBadgePulse {
          0% { 
            transform: scale(1);
            box-shadow: 0 0 10px rgba(0, 255, 136, 0.6);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 0 0 15px rgba(0, 255, 136, 0.8);
          }
          100% { 
            transform: scale(1);
            box-shadow: 0 0 10px rgba(0, 255, 136, 0.6);
          }
        }

        @keyframes breakingNewsGlow {
          0% { 
            box-shadow: 0 0 20px rgba(255, 68, 68, 0.4);
            border-color: #ff6666;
          }
          100% { 
            box-shadow: 0 0 30px rgba(255, 68, 68, 0.8);
            border-color: #ff4444;
          }
        }

        @keyframes breakingNewsShine {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        @keyframes breakingNewsFlash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes regimeShiftGlow {
          0% { 
            box-shadow: 0 0 20px rgba(255, 170, 0, 0.4);
            border-color: #ffcc44;
          }
          100% { 
            box-shadow: 0 0 30px rgba(255, 170, 0, 0.8);
            border-color: #ffaa00;
          }
        }

        /* Mobile styles */
        .mobile .best-setups-section {
          padding: 12px;
          margin-bottom: 15px;
        }

        .mobile .best-setups-section h3 {
          font-size: 13px;
        }

        .mobile .best-setups-grid {
          grid-template-columns: 1fr;
          gap: 10px;
        }

        .mobile .best-setup-card {
          padding: 12px;
        }

        .mobile .metrics-row {
          flex-wrap: wrap;
          gap: 5px;
        }

        .mobile .metric-item {
          flex: 1;
          min-width: 30%;
        }

        .mobile .metric-label {
          font-size: 8px;
        }

        .mobile .metric-value {
          font-size: 10px;
        }

        /* Mobile direction badge */
        .mobile .direction-badge {
          font-size: 9px;
          padding: 2px 6px;
        }
      `}</style>
    </div>
  );
};

export default BestSetupsByTag;