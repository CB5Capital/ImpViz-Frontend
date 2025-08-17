#!/bin/bash

echo "Starting ImpViz Trading Bar React..."
echo "=================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Test WebSocket connection
echo "Testing WebSocket connection..."
node -e "
const WebSocket = require('ws');
const ws = new WebSocket('ws://134.209.184.5:8765');
ws.on('open', () => {
    console.log('✅ WebSocket connection successful');
    ws.close();
    process.exit(0);
});
ws.on('error', (err) => {
    console.log('⚠️  WebSocket connection failed - server may be offline');
    process.exit(1);
});
setTimeout(() => {
    console.log('⚠️  WebSocket connection timeout');
    ws.close();
    process.exit(1);
}, 3000);
" 2>/dev/null || echo "Continuing anyway..."

echo ""
echo "Starting React application..."
echo "The app will open in your browser at http://localhost:3000"
echo ""

npm start