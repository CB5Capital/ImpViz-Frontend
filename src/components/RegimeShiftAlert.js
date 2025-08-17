import React from 'react';

const RegimeShiftAlert = ({ regimeShift, regimeShiftTime }) => {
  if (!regimeShift) return null;

  const getRegimeColor = (regime) => {
    if (regime >= 2) return '#00ff88';
    if (regime >= 1) return '#ffaa00';
    return '#ff4444';
  };

  const getRegimeName = (regime) => {
    if (regime >= 2) return 'BULLISH';
    if (regime >= 1) return 'NEUTRAL';
    return 'BEARISH';
  };

  return (
    <div className="regime-shift-alert">
      <div className="alert-content">
        <div className="alert-title">🚨 REGIME SHIFT DETECTED 🚨</div>
        <div className="regime-transition">
          <span 
            className="regime-badge from"
            style={{ backgroundColor: getRegimeColor(regimeShift.from) }}
          >
            {getRegimeName(regimeShift.from)} ({regimeShift.from})
          </span>
          <span className="arrow">→</span>
          <span 
            className="regime-badge to"
            style={{ backgroundColor: getRegimeColor(regimeShift.to) }}
          >
            {getRegimeName(regimeShift.to)} ({regimeShift.to})
          </span>
        </div>
        <div className="shift-time">
          {regimeShiftTime?.toLocaleTimeString()}
        </div>
      </div>
      
      <style jsx>{`
        .regime-shift-alert {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          background: linear-gradient(135deg, #ff1744, #ff6b35);
          border: 3px solid #fff;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 0 30px rgba(255, 23, 68, 0.8);
          animation: pulse 2s infinite, slideDown 0.5s ease-out;
          max-width: 500px;
          text-align: center;
        }

        .alert-content {
          color: white;
          font-family: 'Arial', sans-serif;
        }

        .alert-title {
          font-size: 1.4em;
          font-weight: bold;
          margin-bottom: 15px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }

        .regime-transition {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-bottom: 10px;
        }

        .regime-badge {
          padding: 8px 16px;
          border-radius: 25px;
          font-weight: bold;
          font-size: 1.1em;
          color: #000;
          text-shadow: none;
          border: 2px solid #fff;
        }

        .arrow {
          font-size: 1.5em;
          font-weight: bold;
          color: #fff;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }

        .shift-time {
          font-size: 0.9em;
          opacity: 0.9;
          font-style: italic;
        }

        @keyframes pulse {
          0%, 100% { 
            box-shadow: 0 0 30px rgba(255, 23, 68, 0.8);
            transform: translateX(-50%) scale(1);
          }
          50% { 
            box-shadow: 0 0 50px rgba(255, 23, 68, 1);
            transform: translateX(-50%) scale(1.05);
          }
        }

        @keyframes slideDown {
          from {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default RegimeShiftAlert;