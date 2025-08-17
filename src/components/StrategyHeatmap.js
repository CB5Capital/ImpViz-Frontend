import React from 'react';

const StrategyHeatmap = ({ data }) => {
  // Check for data in the nested structure
  const heatmapData = data?.data?.signals_by_tag_and_direction_and_market;
  
  if (!heatmapData) {
    return (
      <div className="heatmap-section">
        <h3>STRATEGY METRICS HEATMAP</h3>
        <div className="waiting-message">Waiting for data...</div>
      </div>
    );
  }

  const tagData = heatmapData;
  const market = 'NQ'; // Default market
  
  if (!tagData[market]) {
    return (
      <div className="heatmap-section">
        <h3>STRATEGY METRICS HEATMAP</h3>
        <div className="waiting-message">No data available for {market}</div>
      </div>
    );
  }

  const marketData = tagData[market];
  
  const metrics = [
    'avg_hit_rate', 
    'avg_pnl_per_trade', 
    'avg_duration', 
    'avg_drawdown', 
    'avg_risk_reward_ratio', 
    'sample_size', 
    'active_signals'
  ];
  
  const metricLabels = {
    'avg_hit_rate': 'Hit%',
    'avg_pnl_per_trade': 'P&L',
    'avg_duration': 'Dur(m)',
    'avg_drawdown': 'DD',
    'avg_risk_reward_ratio': 'R/R',
    'sample_size': 'Avg Size',
    'active_signals': 'Active%'
  };

  const strategyColors = {
    'Trend Following': {
      bg: '#1a2332',
      long: '#4a9eff',
      short: '#7bb3ff',
      header: '#6bb6ff'
    },
    'Mean Reversion': {
      bg: '#2d1b32',
      long: '#9d4edd',
      short: '#b968db',
      header: '#d084f0'
    },
    'Trend Reversal': {
      bg: '#2a1f1a',
      long: '#ff8c42',
      short: '#ffaa66',
      header: '#ffcc88'
    }
  };

  const formatValue = (metric, value, dirData) => {
    switch (metric) {
      case 'avg_hit_rate':
        return `${value.toFixed(1)}%`;
      case 'avg_pnl_per_trade':
        return `$${value.toFixed(0)}`;
      case 'avg_duration':
        return `${value.toFixed(0)}m`;
      case 'avg_drawdown':
        return `$${value.toFixed(0)}`;
      case 'avg_risk_reward_ratio':
        return value.toFixed(2);
      case 'sample_size':
        const signalsCount = dirData.signals || 1;
        const sizePerSignal = signalsCount > 0 ? value / signalsCount : 0;
        return sizePerSignal.toFixed(0);
      case 'active_signals':
        // Calculate percentage: active_signals / signals * 100
        const totalSignals = dirData.signals || 1;
        const activeSignals = value || 0;
        const percentage = totalSignals > 0 ? (activeSignals / totalSignals) * 100 : 0;
        return `${percentage.toFixed(1)}%`;
      default:
        return value.toString();
    }
  };

  return (
    <div className="heatmap-section">
      <h3>STRATEGY METRICS HEATMAP</h3>
      
      <div className="heatmap-container">
        {/* Header Row */}
        <div className="heatmap-header">
          <div className="header-cell strategy-label"></div>
          {metrics.map(metric => (
            <div key={metric} className="header-cell metric-label">
              {metricLabels[metric]}
            </div>
          ))}
        </div>

        {/* Strategy Rows */}
        {Object.keys(marketData).map(strategy => {
          const colors = strategyColors[strategy] || {
            bg: '#1a1f3a',
            long: '#00ff88',
            short: '#ff4444',
            header: '#ffaa00'
          };

          return (
            <div key={strategy} className="strategy-group">
              {/* Strategy Label Row */}
              <div className="strategy-header" style={{ color: colors.header }}>
                <div className="strategy-name">{strategy}</div>
              </div>

              {/* Direction Rows */}
              {['Long', 'Short'].map(direction => {
                if (!marketData[strategy][direction]) return null;
                
                const dirData = marketData[strategy][direction];
                const dirColor = direction === 'Long' ? colors.long : colors.short;

                return (
                  <div 
                    key={direction} 
                    className="direction-row"
                    style={{ backgroundColor: colors.bg }}
                  >
                    <div 
                      className="direction-label"
                      style={{ color: dirColor }}
                    >
                      {direction}
                    </div>
                    {metrics.map(metric => {
                      const value = dirData[metric] || 0;
                      return (
                        <div key={metric} className="metric-cell">
                          {formatValue(metric, value, dirData)}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StrategyHeatmap;