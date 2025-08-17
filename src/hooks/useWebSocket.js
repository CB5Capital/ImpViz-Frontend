import { useEffect, useRef, useCallback, useState } from 'react';

export const useWebSocket = (url, onMessage, onConnect, onDisconnect) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastError, setLastError] = useState(null);
  const [connectionState, setConnectionState] = useState('disconnected');
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const mountedRef = useRef(true);

  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        const messageStr = JSON.stringify(message);
        wsRef.current.send(messageStr);
        console.log('📤 Sent WebSocket message:', messageStr);
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        setLastError(`Send error: ${error.message}`);
      }
    } else {
      console.warn('⚠️ WebSocket is not connected. Cannot send message:', message);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    let localWs = null;
    let localReconnectTimeout = null;
    let pingInterval = null;

    const connect = () => {
      if (!mountedRef.current) return;
      
      try {
        console.log(`🔌 Attempting WebSocket connection to ${url}`);
        setConnectionState('connecting');
        
        localWs = new WebSocket(url);
        wsRef.current = localWs;

        localWs.onopen = () => {
          if (!mountedRef.current) return;
          
          console.log('✅ WebSocket connected successfully!');
          setIsConnected(true);
          setConnectionState('connected');
          setConnectionAttempts(0);
          setLastError(null);
          
          // Start ping interval
          pingInterval = setInterval(() => {
            if (localWs.readyState === WebSocket.OPEN) {
              try {
                localWs.send(JSON.stringify({ type: 'ping' }));
                console.log('🏓 Sent ping');
              } catch (err) {
                console.error('Error sending ping:', err);
              }
            }
          }, 30000);
          
          if (onConnect) onConnect();
        };

        localWs.onmessage = (event) => {
          if (!mountedRef.current) return;
          
          try {
            console.log('📨 Raw message:', event.data.substring(0, 200));
            const data = JSON.parse(event.data);
            
            // Handle pong
            if (data.type === 'pong') {
              console.log('🏓 Received pong');
              return;
            }
            
            // Pass to callback
            if (onMessage) {
              console.log('📦 Processing message with data keys:', Object.keys(data));
              onMessage(data);
            }
          } catch (error) {
            console.error('❌ Error parsing message:', error);
          }
        };

        localWs.onerror = (error) => {
          console.error('🔴 WebSocket error:', error);
          setLastError('Connection error');
          setConnectionState('error');
        };

        localWs.onclose = (event) => {
          if (!mountedRef.current) return;
          
          console.log(`🔌 WebSocket disconnected (code: ${event.code}, reason: ${event.reason})`);
          setIsConnected(false);
          setConnectionState('disconnected');
          
          // Clear ping interval
          if (pingInterval) {
            clearInterval(pingInterval);
            pingInterval = null;
          }
          
          if (onDisconnect) onDisconnect();
          
          // Reconnect with exponential backoff
          if (mountedRef.current) {
            const attempts = connectionAttempts;
            setConnectionAttempts(prev => prev + 1);
            const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
            
            console.log(`⏱️ Reconnecting in ${delay}ms (attempt ${attempts + 1})`);
            localReconnectTimeout = setTimeout(() => {
              if (mountedRef.current) {
                connect();
              }
            }, delay);
          }
        };
      } catch (error) {
        console.error('❌ Failed to create WebSocket:', error);
        setConnectionState('error');
        setLastError(error.message);
        
        // Retry connection
        if (mountedRef.current) {
          localReconnectTimeout = setTimeout(() => {
            if (mountedRef.current) {
              connect();
            }
          }, 5000);
        }
      }
    };

    // Initial connection
    connect();

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up WebSocket connection');
      mountedRef.current = false;
      
      if (localReconnectTimeout) {
        clearTimeout(localReconnectTimeout);
      }
      
      if (pingInterval) {
        clearInterval(pingInterval);
      }
      
      if (localWs) {
        localWs.close();
      }
      
      wsRef.current = null;
    };
  }, [url]); // Only reconnect when URL changes

  return { 
    sendMessage, 
    isConnected, 
    connectionAttempts, 
    lastError,
    connectionState
  };
};