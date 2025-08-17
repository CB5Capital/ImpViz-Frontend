import React from 'react';

const MarketSummary = ({ marketData }) => {
  const calculateSummary = () => {
    let totalSignals = 0;
    let longSignals = 0;
    let shortSignals = 0;
    let marketsCount = 0;
    
    for (const market of Object.values(marketData)) {
      if (market.Long || market.Short) {
        marketsCount++;
        const longCount = market.Long?.signals_count || 0;
        const shortCount = market.Short?.signals_count || 0;
        totalSignals += longCount + shortCount;
        longSignals += longCount;
        shortSignals += shortCount;
      }
    }
    
    return { totalSignals, longSignals, shortSignals, marketsCount };
  };
  
  const { totalSignals, longSignals, shortSignals, marketsCount } = calculateSummary();
  
  return (
    <div className="market-summary">
      <div className="summary-card">
        <div className="summary-item">
          <span className="summary-label">TOTAL</span>
          <span className="summary-value">{totalSignals}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">LONG</span>
          <span className="summary-value long">{longSignals}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">SHORT</span>
          <span className="summary-value short">{shortSignals}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">MARKETS</span>
          <span className="summary-value">{marketsCount}</span>
        </div>
      </div>
    </div>
  );
};

export default MarketSummary;