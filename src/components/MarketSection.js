import React from 'react';

const MarketSection = ({ data }) => {
  // Check for market data in signals_by_market
  const marketData = data?.data?.signals_by_market;
  
  if (!marketData) {
    return (
      <div className="market-section">
        <h3>MARKET DATA</h3>
        <div className="waiting-message">Waiting for market data...</div>
      </div>
    );
  }
  const markets = Object.keys(marketData).sort();

  const formatStrength = (value) => {
    return Math.round(value || 0);
  };

  const getStrengthColor = (strength) => {
    if (strength >= 70) return '#00ff88';
    if (strength >= 50) return '#ffaa00';
    if (strength >= 30) return '#ff6600';
    return '#666666';
  };

  const MarketCard = ({ marketName, marketInfo }) => {
    const longData = marketInfo.Long || {};
    const shortData = marketInfo.Short || {};
    
    const longStrength = formatStrength(longData.final_score);
    const shortStrength = formatStrength(shortData.final_score);
    
    const netDifference = Math.abs(longStrength - shortStrength);
    let winner = null;
    let winnerColor = '#666666';
    
    if (longStrength > shortStrength && longStrength > 0) {
      winner = 'LONG';
      winnerColor = '#00ff88';
    } else if (shortStrength > longStrength && shortStrength > 0) {
      winner = 'SHORT';
      winnerColor = '#ff4444';
    }

    return (
      <div className="market-card">
        <div className="market-header">
          <h4>{marketName}</h4>
          {winner && (
            <div className="winner-badge" style={{ color: winnerColor }}>
              {winner} +{netDifference}
            </div>
          )}
        </div>
        
        <div className="market-directions">
          {/* Long Side */}
          <div className="direction-panel long">
            <div className="direction-header">
              <span className="direction-label">LONG</span>
              <span 
                className="strength-value" 
                style={{ color: getStrengthColor(longStrength) }}
              >
                {longStrength}%
              </span>
            </div>
            <div className="direction-metrics">
              <div className="metric">
                <span>Signals:</span>
                <span>{longData.signals_count || 0}</span>
              </div>
              <div className="metric">
                <span>Timeframes:</span>
                <span>{longData.timeframes_count || 0}</span>
              </div>
              <div className="metric">
                <span>Conviction:</span>
                <span>{longData.conviction || 0}/3</span>
              </div>
              <div className="metric">
                <span>Certainty:</span>
                <span>{Math.round(longData.certainty || 0)}%</span>
              </div>
            </div>
          </div>

          {/* Short Side */}
          <div className="direction-panel short">
            <div className="direction-header">
              <span className="direction-label">SHORT</span>
              <span 
                className="strength-value" 
                style={{ color: getStrengthColor(shortStrength) }}
              >
                {shortStrength}%
              </span>
            </div>
            <div className="direction-metrics">
              <div className="metric">
                <span>Signals:</span>
                <span>{shortData.signals_count || 0}</span>
              </div>
              <div className="metric">
                <span>Timeframes:</span>
                <span>{shortData.timeframes_count || 0}</span>
              </div>
              <div className="metric">
                <span>Conviction:</span>
                <span>{shortData.conviction || 0}/3</span>
              </div>
              <div className="metric">
                <span>Certainty:</span>
                <span>{Math.round(shortData.certainty || 0)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Setup Names */}
        {(longData.setup_names?.length > 0 || shortData.setup_names?.length > 0) && (
          <div className="active-setups">
            <div className="setups-title">Active Setups:</div>
            <div className="setups-grid">
              {longData.setup_names?.map((setup, idx) => (
                <div key={`long-${idx}`} className="setup-tag long">
                  L: {setup}
                </div>
              ))}
              {shortData.setup_names?.map((setup, idx) => (
                <div key={`short-${idx}`} className="setup-tag short">
                  S: {setup}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="market-section">
      <h3>MARKET DATA</h3>
      
      <div className="markets-grid">
        {markets.map(marketName => (
          <MarketCard 
            key={marketName} 
            marketName={marketName} 
            marketInfo={marketData[marketName]} 
          />
        ))}
      </div>
    </div>
  );
};

export default MarketSection;