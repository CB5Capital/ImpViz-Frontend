import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ScoreChart = ({ scoreHistory, onClearHistory }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  const chartData = scoreHistory.map(item => ({
    time: formatTime(item.timestamp),
    score: Math.round(item.score * 100) / 100,
    long: item.longScore > 0 ? Math.round(item.longScore * 100) / 100 : null,
    short: item.shortScore > 0 ? Math.round(item.shortScore * 100) / 100 : null
  }));
  
  return (
    <div className="score-chart-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>SCORE TREND CHART</h3>
        {onClearHistory && (
          <button 
            onClick={onClearHistory}
            style={{
              background: '#1a1f3a',
              color: '#00d4ff',
              border: '1px solid #00d4ff',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        )}
      </div>
      
      {chartData.length === 0 ? (
        <div className="chart-placeholder">
          <p>No score data yet...</p>
        </div>
      ) : (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1f3a" />
              <XAxis 
                dataKey="time" 
                stroke="#666"
                tick={{ fontSize: 10 }}
                interval={Math.max(1, Math.floor(chartData.length / 6))}
              />
              <YAxis 
                stroke="#666"
                tick={{ fontSize: 10 }}
                domain={['dataMin - 5', 'dataMax + 5']}
                tickFormatter={(value) => Math.round(value)}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0a0e27', 
                  border: '1px solid #1a1f3a',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
                labelStyle={{ color: '#fff' }}
                formatter={(value, name) => [Math.round(value * 100) / 100, name]}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke={chartData.length > 0 && chartData[chartData.length - 1].score >= 0 ? '#00ff88' : '#ff4444'}
                strokeWidth={2}
                dot={false}
                name="Net Score"
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="long" 
                stroke="#4a9eff" 
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name="Long Score"
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="short" 
                stroke="#ff8c42" 
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name="Short Score"
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ScoreChart;