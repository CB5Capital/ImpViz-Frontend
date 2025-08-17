export const convertSignalsToMarketFormat = (signalsData) => {
  const marketData = {};
  const signalsByMarket = signalsData.signals_by_market || {};
  
  for (const [market, marketSignals] of Object.entries(signalsByMarket)) {
    marketData[market] = {
      Long: {
        signals_count: 0,
        base_strength: 0,
        final_score: 0,
        setup_names: [],
        individual_signals: [],
        adjusted_strength: 0,
        timeframes_count: 0,
        conviction: 0,
        conviction_impact: 0,
        correlation_penalty: 0,
        signal_left_impact: 0,
        certainty: 100,
        conviction_penalty: 0
      },
      Short: {
        signals_count: 0,
        base_strength: 0,
        final_score: 0,
        setup_names: [],
        individual_signals: [],
        adjusted_strength: 0,
        timeframes_count: 0,
        conviction: 0,
        conviction_impact: 0,
        correlation_penalty: 0,
        signal_left_impact: 0,
        certainty: 100,
        conviction_penalty: 0
      }
    };
    
    const signals = marketSignals.signals || [];
    const timeframesSet = { Long: new Set(), Short: new Set() };
    
    for (const signal of signals) {
      const direction = signal.direction || 'Long';
      
      if (direction in marketData[market]) {
        const directionData = marketData[market][direction];
        
        const hasSignal = signal.has_active_signal === 1 || signal.has_active_signal === true;
        if (hasSignal) {
          directionData.signals_count += 1;
          directionData.base_strength += signal.signal_strength || 0;
          
          const setupName = signal.setup_name || 'Unknown';
          if (!directionData.setup_names.includes(setupName)) {
            directionData.setup_names.push(setupName);
          }
          
          directionData.individual_signals.push(signal);
          
          if (signal.timeframe) {
            timeframesSet[direction].add(signal.timeframe);
          }
        }
      }
    }
    
    for (const direction of ['Long', 'Short']) {
      const directionData = marketData[market][direction];
      
      if (directionData.signals_count > 0) {
        directionData.timeframes_count = timeframesSet[direction].size;
        directionData.final_score = directionData.base_strength / directionData.signals_count;
        directionData.base_strength = directionData.final_score;
        directionData.adjusted_strength = directionData.final_score * 2;
        
        directionData.conviction = Math.min(3, Math.floor(directionData.signals_count / 2));
        directionData.conviction_impact = directionData.conviction * 5;
        
        directionData.correlation_penalty = Math.max(0, (4 - directionData.timeframes_count) * 10);
        directionData.certainty = 100 - directionData.correlation_penalty;
        
        const longStr = marketData[market].Long.adjusted_strength;
        const shortStr = marketData[market].Short.adjusted_strength;
        if (longStr > 10 && shortStr > 10) {
          directionData.certainty = Math.max(0, directionData.certainty - 50);
        }
        
        directionData.conviction_penalty = 
          directionData.conviction === 1 ? -10 : 
          directionData.conviction === 2 ? -5 : 0;
        
        directionData.final_score = (
          directionData.adjusted_strength + 
          directionData.conviction_impact + 
          directionData.certainty + 
          directionData.signal_left_impact + 
          directionData.conviction_penalty
        ) / 4;
      } else {
        directionData.final_score = 0;
        directionData.base_strength = 0;
        directionData.adjusted_strength = 0;
      }
    }
  }
  
  return marketData;
};

export const calculateFallbackScore = (directionData) => {
  if (!directionData || directionData.signals_count === 0) {
    return 0;
  }
  
  const baseStrength = (directionData.base_strength || 0) * 2;
  const convictionImpact = directionData.conviction_impact || 0;
  const correlationPenalty = directionData.correlation_penalty || 0;
  const signalLeftImpact = directionData.signal_left_impact || 0;
  const certainty = 100 - correlationPenalty;
  
  const conviction = directionData.conviction || 0;
  const convictionPenalty = conviction === 1 ? -10 : (conviction === 2 ? -5 : 0);
  
  return (baseStrength + convictionImpact + certainty + signalLeftImpact + convictionPenalty) / 4;
};

export const processMarketData = (data) => {
  if (data.type === 'error') {
    return null;
  }
  
  const rawData = data.data || {};
  
  if ('signals_by_market' in rawData) {
    return convertSignalsToMarketFormat(rawData);
  }
  
  return rawData;
};

export const getSignalColor = (strength) => {
  if (strength >= 70) return '#00ff88';
  if (strength >= 50) return '#ffaa00';
  if (strength >= 30) return '#ff6600';
  return '#666666';
};

export const formatPercentage = (value) => {
  if (value === undefined || value === null) return '0%';
  return `${Math.round(value)}%`;
};

export const formatNumber = (value, decimals = 2) => {
  if (value === undefined || value === null) return '0';
  return value.toFixed(decimals);
};