import { useEffect, useRef, useState, useCallback } from "react";

interface WebSocketMessage {
  type: string;
  [key: string]: unknown;
}

/**
 * useWebSocketAuth - Manages a single authenticated WebSocket connection.
 * @param onMessage Optional callback for handling incoming messages.
 * 
 * Fixes:
 * 1. Uses a ref for the callback to prevent effect re-runs when the callback identity changes.
 * 2. Ensures only one connection is active and properly cleaned up.
 * 3. Handles automatic reconnection with a stable timeout reference.
 */
export function useWebSocketAuth(onMessage?: (data: WebSocketMessage) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const connectRef = useRef<() => void>(() => {});
  
  // 1. Use a ref to store the latest onMessage callback.
  // This allows the effect to access the latest logic without re-running 
  // every time the caller's function identity changes.
  const onMessageRef = useRef(onMessage);
  
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Prevent multiple simultaneous connection attempts
    if (socketRef.current && (socketRef.current.readyState === WebSocket.CONNECTING || socketRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    
    // Construct WebSocket URL
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = isLocalhost ? "localhost:8080" : window.location.host;
    const wsUrl = `${protocol}//${host}/api/ws?token=${token}`;

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    socket.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        // Execute the latest version of the callback from ref
        if (onMessageRef.current) {
          onMessageRef.current(data);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    socket.onclose = (event) => {
      console.log("WebSocket closed", event.reason);
      setIsConnected(false);
      socketRef.current = null;

      // Auto-reconnect after 3 seconds, but only if we're not currently unmounting
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = window.setTimeout(() => {
          reconnectTimeoutRef.current = null;
          connectRef.current();
        }, 3000);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      socket.close();
    };

    socketRef.current = socket;
  }, []); // Stable identity

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      // 2. Comprehensive Cleanup
      if (socketRef.current) {
        // Clear event listeners manually before closing to avoid any 
        // lingering logic firing during the close sequence.
        socketRef.current.onopen = null;
        socketRef.current.onmessage = null;
        socketRef.current.onclose = null;
        socketRef.current.onerror = null;
        socketRef.current.close();
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: unknown) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  return { isConnected, sendMessage };
}
