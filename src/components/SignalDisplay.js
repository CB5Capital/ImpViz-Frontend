import React from 'react';
import { calculateFallbackScore, formatPercentage } from '../utils/dataProcessing';

const SignalDisplay = ({ marketData, marketName }) => {
  const longData = marketData.Long || {};
  const shortData = marketData.Short || {};
  
  const longScore = longData.final_score || calculateFallbackScore(longData);
  const shortScore = shortData.final_score || calculateFallbackScore(shortData);
  
  const netDifference = Math.abs(longScore - shortScore);
  
  let winner = null;
  let winnerStrength = 0;
  let winnerColor = '#666666';
  let winnerData = null;
  
  if (longScore > shortScore && longScore > 0) {
    winner = 'LONG';
    winnerStrength = netDifference;
    winnerColor = '#00ff88';
    winnerData = longData;
  } else if (shortScore > longScore && shortScore > 0) {
    winner = 'SHORT';
    winnerStrength = netDifference;
    winnerColor = '#ff4444';
    winnerData = shortData;
  }
  
  const DirectionBreakdown = ({ direction, data, color }) => {
    if (!data || data.signals_count === 0) return null;
    
    const strength = data.adjusted_strength || 0;
    const conviction = data.conviction || 0;
    const certainty = data.certainty || 100;
    const convictionPenalty = data.conviction_penalty || 0;
    
    return (
      <div className="direction-breakdown">
        <div className="direction-header">
          <span className="direction-label" style={{ color }}>{direction}</span>
          <span className="direction-strength">{formatPercentage(strength)}</span>
        </div>
        
        <div className="direction-metrics">
          <div className="metric-row">
            <span className="metric-label">Signals:</span>
            <span className="metric-value">{data.signals_count}</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Timeframes:</span>
            <span className="metric-value">{data.timeframes_count || 0}</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Conviction:</span>
            <span className="metric-value">{conviction}/3</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Certainty:</span>
            <span className="metric-value">{formatPercentage(certainty)}</span>
          </div>
          {convictionPenalty !== 0 && (
            <div className="metric-row">
              <span className="metric-label">Penalty:</span>
              <span className="metric-value penalty">{convictionPenalty}</span>
            </div>
          )}
        </div>
        
        {data.setup_names && data.setup_names.length > 0 && (
          <div className="setups-list">
            <div className="setups-label">Active Setups:</div>
            {data.setup_names.map((setup, idx) => (
              <div key={idx} className="setup-name">{setup}</div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="signal-display">
      <div className="market-header">
        <h2>{marketName}</h2>
        {winner && (
          <div className="winner-indicator" style={{ borderColor: winnerColor }}>
            <div className="winner-label" style={{ color: winnerColor }}>
              {winner}
            </div>
            <div className="winner-strength">
              {formatPercentage(winnerStrength)}
            </div>
          </div>
        )}
      </div>
      
      <div className="signal-content">
        <div className="directions-container">
          <DirectionBreakdown 
            direction="LONG" 
            data={longData} 
            color="#00ff88" 
          />
          <DirectionBreakdown 
            direction="SHORT" 
            data={shortData} 
            color="#ff4444" 
          />
        </div>
        
        {winner && winnerData && (
          <div className="signal-summary" style={{ borderColor: winnerColor }}>
            <div className="summary-row">
              <span>Direction:</span>
              <span style={{ color: winnerColor }}>{winner}</span>
            </div>
            <div className="summary-row">
              <span>Net Strength:</span>
              <span>{formatPercentage(netDifference)}</span>
            </div>
            <div className="summary-row">
              <span>Active Signals:</span>
              <span>{winnerData.signals_count}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignalDisplay;