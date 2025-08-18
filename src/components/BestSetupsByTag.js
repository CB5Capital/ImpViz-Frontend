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

  // TAG mapping from the backend
  const tagMapping = {
    "MACD Convergence": "Trend Following",
    "SMA 5/20 Convergence": "Trend Following",
    "Williams %R 1/99 -> 20/80": "Mean Reversion",
    "Williams %R 10/90 -> 50/50": "Mean Reversion",
    "SMA 5/20 + Williams %R Counter Trend": "Trend Reversal"
  };

  // Collect all signals and organize by TAG
  const signalsByTag = {
    "Trend Following": [],
    "Mean Reversion": [],
    "Trend Reversal": []
  };

  // Process all markets
  Object.entries(signalsData).forEach(([market, marketData]) => {
    if (marketData.signals) {
      marketData.signals.forEach(signal => {
        // Map setup name to TAG
        let tag = null;
        Object.entries(tagMapping).forEach(([setupPattern, tagName]) => {
          if (signal.setup_name && signal.setup_name.includes(setupPattern.split(' ')[0])) {
            tag = tagName;
          }
        });

        if (tag && signal.has_active_signal === 1) {
          signalsByTag[tag].push({
            ...signal,
            market: market
          });
        }
      });
    }
  });

  // Find best setup for each TAG
  const bestSetupsByTag = {};
  
  Object.entries(signalsByTag).forEach(([tag, signals]) => {
    if (signals.length > 0) {
      // Sort by a composite score: signal_strength * hit_rate * (1 + pnl_per_trade/100)
      const sortedSignals = signals.sort((a, b) => {
        const scoreA = (a.signal_strength || 0) * (a.hit_rate || 0) * (1 + (a.pnl_per_trade || 0) / 100);
        const scoreB = (b.signal_strength || 0) * (b.hit_rate || 0) * (1 + (b.pnl_per_trade || 0) / 100);
        return scoreB - scoreA;
      });
      
      bestSetupsByTag[tag] = sortedSignals[0];
    }
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
      <h3>🏆 BEST ACTIVE SETUPS BY STRATEGY</h3>
      
      {Object.keys(bestSetupsByTag).length === 0 ? (
        <div className="no-active-setups">
          <p>No active setups currently</p>
        </div>
      ) : (
        <div className="best-setups-grid">
          {Object.entries(bestSetupsByTag).map(([tag, setup]) => (
            <div key={tag} className="best-setup-card">
              <div className="setup-header">
                <span className="tag-icon">{getTagIcon(tag)}</span>
                <span className="tag-name">{tag}</span>
              </div>
              
              <div className="setup-details">
                <div className="setup-name">
                  {setup.setup_name}
                </div>
                
                <div className="setup-market-direction">
                  <span className="market">{setup.market}</span>
                  <span 
                    className="direction"
                    style={{ color: getDirectionColor(setup.direction) }}
                  >
                    {setup.direction}
                  </span>
                  <span className="timeframe">{setup.timeframe}</span>
                </div>
                
                <div className="setup-metrics">
                  <div className="metric-item">
                    <span className="metric-label">Signal</span>
                    <span className="metric-value">{setup.signal_strength?.toFixed(1)}%</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Hit Rate</span>
                    <span className="metric-value">{(setup.hit_rate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">P&L</span>
                    <span 
                      className="metric-value"
                      style={{ color: setup.pnl_per_trade > 0 ? '#00ff88' : '#ff4444' }}
                    >
                      ${setup.pnl_per_trade?.toFixed(0)}
                    </span>
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

                <div className="signal-age">
                  {setup.signal_age_minutes && (
                    <span className="age-indicator">
                      Active for {setup.signal_age_minutes < 60 
                        ? `${setup.signal_age_minutes.toFixed(0)}m` 
                        : `${(setup.signal_age_minutes / 60).toFixed(1)}h`}
                    </span>
                  )}
                </div>
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
          display: flex;
          flex-direction: column;
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

        .signal-age {
          text-align: center;
          margin-top: 5px;
        }

        .age-indicator {
          font-size: 10px;
          color: #666;
          background: rgba(0, 0, 0, 0.3);
          padding: 2px 8px;
          border-radius: 10px;
        }

        /* Mobile styles */
        .mobile .best-setups-section {
          padding: 12px;
          margin-bottom: 15px;
        }

        .mobile .best-setups-section h3 {
          font-size: 13px;
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
      `}</style>
    </div>
  );
};

export default BestSetupsByTag;