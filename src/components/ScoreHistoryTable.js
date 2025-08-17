import React, { useState } from 'react';

const ScoreHistoryTable = ({ scoreHistory, regimeData }) => {
  const [timeframe, setTimeframe] = useState('Raw');
  
  const timeframeOptions = [
    'Raw', '1min', '5min', '10min', '15min', '30min', '1h'
  ];

  // Aggregate data based on selected timeframe
  const aggregateData = (data, interval) => {
    if (interval === 'Raw' || data.length === 0) {
      return data;
    }

    const intervalMs = {
      '1min': 60 * 1000,
      '5min': 5 * 60 * 1000,
      '10min': 10 * 60 * 1000,
      '15min': 15 * 60 * 1000,
      '30min': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000
    };

    const bucketSize = intervalMs[interval];
    if (!bucketSize) return data;

    const buckets = {};
    
    data.forEach(entry => {
      const bucketTime = Math.floor(entry.timestamp.getTime() / bucketSize) * bucketSize;
      
      if (!buckets[bucketTime]) {
        buckets[bucketTime] = {
          entries: [],
          timestamp: new Date(bucketTime)
        };
      }
      buckets[bucketTime].entries.push(entry);
    });

    // Aggregate each bucket
    return Object.values(buckets).map(bucket => {
      const scores = bucket.entries.map(e => e.score);
      const regimes = bucket.entries.map(e => e.regime).filter(r => r !== null);
      
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const avgRegime = regimes.length > 0 ? regimes.reduce((a, b) => a + b, 0) / regimes.length : null;
      
      return {
        timestamp: bucket.timestamp,
        score: avgScore,
        regime: avgRegime
      };
    }).sort((a, b) => a.timestamp - b.timestamp);
  };

  // Combine score and regime data
  const combinedHistory = scoreHistory.map(entry => {
    const regime = regimeData?.NQ || null;
    return {
      ...entry,
      regime: regime
    };
  });

  // Apply aggregation and show last 10 entries (most recent first)
  const aggregatedData = aggregateData(combinedHistory, timeframe);
  const displayData = aggregatedData.slice(-10).reverse();

  const getScoreColor = (score) => {
    if (score >= 0) return '#00ff88';
    return '#ff4444';
  };

  const getRegimeColor = (regime) => {
    if (regime === null || regime === undefined) return '#666';
    if (regime >= 2) return '#00ff88';
    if (regime >= 1) return '#ffaa00';
    return '#ff4444';
  };

  const detectRegimeShift = (currentRegime, index) => {
    if (index === 0 || currentRegime === null) return false;
    const previousRegime = displayData[index - 1]?.regime;
    return previousRegime !== null && Math.floor(currentRegime) !== Math.floor(previousRegime);
  };

  return (
    <div className="score-history-section">
      <div className="history-header-row">
        <h3>SCORE & REGIME HISTORY</h3>
        <div className="timeframe-selector">
          <label>Timeframe:</label>
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="timeframe-dropdown"
          >
            {timeframeOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {displayData.length === 0 ? (
        <div className="waiting-message">No score history yet...</div>
      ) : (
        <div className="history-table">
          {/* Header */}
          <div className="history-header">
            <div className="header-cell time-col">Time</div>
            <div className="header-cell score-col">Score</div>
            <div className="header-cell regime-col">Regime</div>
          </div>
          
          {/* Data Rows */}
          <div className="history-rows">
            {displayData.map((entry, index) => {
              const isRegimeShift = detectRegimeShift(entry.regime, index);
              
              return (
                <div 
                  key={index}
                  className={`history-row ${isRegimeShift ? 'regime-shift' : ''}`}
                >
                  <div className="data-cell time-col">
                    {entry.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit' 
                    })}
                  </div>
                  <div 
                    className="data-cell score-col"
                    style={{ color: getScoreColor(entry.score) }}
                  >
                    {entry.score.toFixed(1)}
                  </div>
                  <div 
                    className="data-cell regime-col"
                    style={{ 
                      color: getRegimeColor(entry.regime),
                      fontWeight: isRegimeShift ? 'bold' : 'normal'
                    }}
                  >
                    {entry.regime !== null ? Math.floor(entry.regime) : '-'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreHistoryTable;