import React from 'react';

const BestSetupsByTag = ({ data }) => {
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

        // Include ALL signals, not just active ones
        if (tag && signal.direction && (signal.direction === 'Long' || signal.direction === 'Short')) {
          signalsByTagAndDirection[tag][signal.direction].push({
            ...signal,
            market: market,
            // Add a flag to indicate if signal is active
            isActive: signal.has_active_signal === 1
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
        
        bestSetupsByTagAndDirection.push({
          tag: tag,
          direction: direction,
          setup: sortedSignals[0]
        });
      }
    });
  });

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

  return (
    <div className="best-setups-section">
      <h3>🏆 BEST SETUPS BY STRATEGY (CURRENT REGIME)</h3>
      
      {bestSetupsByTagAndDirection.length === 0 ? (
        <div className="no-active-setups">
          <p>No setups available in current regime</p>
        </div>
      ) : (
        <div className="best-setups-grid">
          {bestSetupsByTagAndDirection.map(({ tag, direction, setup }, index) => (
            <div key={`${tag}-${direction}`} className="best-setup-card">
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
                  <span className="active-badge">ACTIVE</span>
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
                  <div className="metric-item">
                    <span className="metric-label">Hit Rate</span>
                    <span className="metric-value">{(setup.hit_rate * 100).toFixed(1)}%</span>
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
                    <span className="metric-label">R/R</span>
                    <span className="metric-value">{setup.risk_reward_ratio?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Samples</span>
                    <span className="metric-value">{setup.sample_size || 0}</span>
                  </div>
                </div>

                {setup.current_price && (
                  <div className="price-targets">
                    <div className="current-price">
                      Current: ${setup.current_price?.toFixed(2)}
                    </div>
                    {setup.take_profit && (
                      <div className="target-price" style={{ color: '#00ff88' }}>
                        TP: ${setup.take_profit?.toFixed(2)}
                      </div>
                    )}
                    {setup.stop_loss && (
                      <div className="target-price" style={{ color: '#ff4444' }}>
                        SL: ${setup.stop_loss?.toFixed(2)}
                      </div>
                    )}
                  </div>
                )}

                {setup.isActive && (
                  <div className="signal-status">
                    <div className="signal-strength">
                      Signal Strength: <strong>{setup.signal_strength?.toFixed(1)}%</strong>
                    </div>
                    {setup.signal_age_minutes && (
                      <div className="signal-age">
                        <span className="age-indicator">
                          Active for {setup.signal_age_minutes < 60 
                            ? `${setup.signal_age_minutes.toFixed(0)}m` 
                            : `${(setup.signal_age_minutes / 60).toFixed(1)}h`}
                        </span>
                      </div>
                    )}
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
          background: #00ff88;
          color: #0a0e27;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 9px;
          font-weight: bold;
          animation: pulse 2s infinite;
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
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding: 8px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }

        .metric-item {
          display: flex;
          flex-direction: column;
          align-items: center;
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

        .price-targets {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          padding: 6px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }

        .current-price {
          color: #999;
        }

        .target-price {
          font-weight: bold;
        }

        .signal-status {
          margin-top: 10px;
          padding: 8px;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 4px;
        }

        .signal-strength {
          font-size: 11px;
          color: #00d4ff;
          text-align: center;
          margin-bottom: 5px;
        }

        .signal-age {
          text-align: center;
          margin-top: 5px;
        }

        .age-indicator {
          font-size: 10px;
          color: #999;
          background: rgba(0, 0, 0, 0.3);
          padding: 2px 8px;
          border-radius: 10px;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
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

        .mobile .setup-metrics {
          flex-wrap: wrap;
        }

        .mobile .metric-item {
          flex: 1;
          min-width: 30%;
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