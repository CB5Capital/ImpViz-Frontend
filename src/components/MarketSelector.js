import React from 'react';

const MarketSelector = ({ markets, selectedMarket, onMarketChange }) => {
  return (
    <div className="market-selector">
      <label>Market:</label>
      <select 
        value={selectedMarket} 
        onChange={(e) => onMarketChange(e.target.value)}
        className="market-dropdown"
      >
        {markets.map(market => (
          <option key={market} value={market}>
            {market}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MarketSelector;