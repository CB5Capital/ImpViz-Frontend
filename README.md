# Trading Bar React

React version of the ImpViz Active Trader - Professional Market Signal Display System with real-time WebSocket connectivity.

## Features

- Real-time market signal monitoring
- WebSocket connection to SuperModelWebSocket server
- Live Long/Short signal analysis
- Market strength indicators
- Historical score tracking with charts
- Professional dark trading terminal UI
- Support for multiple markets (ES, NQ, etc.)
- Environment switching (Production/Local)

## Installation

```bash
npm install
```

## Usage

### Quick Start

```bash
# Using the start script
./start_trading_bar.sh

# Or directly with npm
npm start
```

The application will open in your browser at http://localhost:3000

### Environment Modes

- **Production**: Connects to `ws://134.209.184.5:8765`
- **Local**: Connects to `ws://localhost:8765`

Toggle between environments using the button in the UI.

## Features Overview

### Connection Status
- Real-time connection indicator
- Last update timestamp
- Auto-reconnection on disconnect

### Market Summary
- Total active signals
- Long/Short signal counts
- Number of active markets

### Signal Display
- Direction breakdown (Long/Short)
- Signal strength percentages
- Conviction levels
- Certainty calculations
- Active setup names
- Net difference indicator

### Historical Chart
- 5-minute rolling window
- Long/Short/Net difference tracking
- Real-time updates

## Development

```bash
# Start development server
npm start

# Build for production
npm build

# Run tests
npm test
```

## WebSocket Data Format

The app expects market data in the following format:

```json
{
  "type": "market_data",
  "data": {
    "ES": {
      "Long": {
        "signals_count": 5,
        "base_strength": 65,
        "final_score": 72.5,
        "setup_names": ["Setup1", "Setup2"],
        "timeframes_count": 3,
        "conviction": 2,
        "certainty": 80
      },
      "Short": {
        "signals_count": 2,
        "base_strength": 45,
        "final_score": 48.2,
        "setup_names": ["Setup3"],
        "timeframes_count": 2,
        "conviction": 1,
        "certainty": 70
      }
    }
  }
}
```

## Requirements

- Node.js 14+
- npm or yarn
- Active WebSocket server (SuperModelWebSocket)

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

Proprietary - CB5Capital