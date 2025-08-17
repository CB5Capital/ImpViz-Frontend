import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HistoricalChart = ({ scoreHistory }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const chartData = scoreHistory.map(item => ({
    time: formatTime(item.timestamp),
    long: Math.round(item.longScore),
    short: Math.round(item.shortScore),
    net: Math.round(item.netDifference)
  }));
  
  if (chartData.length === 0) {
    return (
      <div className="historical-chart empty">
        <h3>Score History</h3>
        <p>No data available yet</p>
      </div>
    );
  }
  
  return (
    <div className="historical-chart">
      <h3>Score History (5 min)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1f3a" />
          <XAxis 
            dataKey="time" 
            stroke="#666"
            tick={{ fontSize: 10 }}
          />
          <YAxis 
            stroke="#666"
            tick={{ fontSize: 10 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0a0e27', 
              border: '1px solid #1a1f3a',
              borderRadius: '4px'
            }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="long" 
            stroke="#00ff88" 
            strokeWidth={2}
            dot={false}
            name="Long"
          />
          <Line 
            type="monotone" 
            dataKey="short" 
            stroke="#ff4444" 
            strokeWidth={2}
            dot={false}
            name="Short"
          />
          <Line 
            type="monotone" 
            dataKey="net" 
            stroke="#ffaa00" 
            strokeWidth={2}
            dot={false}
            name="Net Difference"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoricalChart;