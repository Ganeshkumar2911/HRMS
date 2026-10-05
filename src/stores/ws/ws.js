import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getWsURL } from "@/api/request";
import authToken from "@/common/authToken";

const HEARTBEAT_INTERVAL_MS = 30000;
const MAX_RECONNECT_DELAY_MS = 30000;

export const useWsStore = defineStore("ws", () => {
  // ─── State ─────────────────────────────────────────────
  const status = ref("disconnected"); // 'disconnected' | 'connecting' | 'connected' | 'reconnecting'
  const lastHeartbeat = ref(null);
  const reconnectAttempts = ref(0);
  const lastError = ref(null);

  let socket = null;
  let heartbeatTimer = null;
  let reconnectTimer = null;
  let intentionalClose = false;

  // Event listener registry
  const subscribers = new Map();

  // ─── Computed ──────────────────────────────────────────
  const isConnected = computed(() => status.value === "connected");
  const isReconnecting = computed(() => status.value === "reconnecting");

  // ─── Heartbeat ─────────────────────────────────────────
  const startHeartbeat = () => {
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ event: "presence.heartbeat" }));
      }
    }, HEARTBEAT_INTERVAL_MS);
  };

  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  };

  // ─── Connect ───────────────────────────────────────────
  const connect = (token = "") => {
    const activeToken = token || authToken.getAccessToken();
    if (!activeToken) {
      status.value = "disconnected";
      return;
    }

    // If already connected or connecting
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    intentionalClose = false;
    status.value = reconnectAttempts.value > 0 ? "reconnecting" : "connecting";

    const wsUrl = getWsURL(activeToken);

    try {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        status.value = "connected";
        reconnectAttempts.value = 0;
        lastError.value = null;
        startHeartbeat();
        emit("open", { timestamp: Date.now() });
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          // Handle heartbeat presence response
          if (payload.event === "presence.update") {
            lastHeartbeat.value = new Date();
          }

          // Emit to all matching subscribers
          if (payload.event) {
            emit(payload.event, payload.data ?? payload);
          }
          emit("*", payload);
        } catch (_) {
          // If non-JSON text frame
          emit("raw", event.data);
        }
      };

      socket.onclose = (event) => {
        stopHeartbeat();
        socket = null;

        // Code 4401: token missing/invalid/session revoked
        if (event.code === 4401) {
          status.value = "disconnected";
          lastError.value = "WebSocket authentication rejected (Code 4401).";
          emit("auth_rejected", event);
          return;
        }

        if (intentionalClose) {
          status.value = "disconnected";
          return;
        }

        // Auto-reconnect with exponential backoff
        status.value = "reconnecting";
        const delay = Math.min(1000 * 2 ** reconnectAttempts.value, MAX_RECONNECT_DELAY_MS);
        reconnectAttempts.value += 1;

        reconnectTimer = setTimeout(() => {
          connect();
        }, delay);
      };

      socket.onerror = (err) => {
        lastError.value = "WebSocket connection error.";
        emit("error", err);
      };
    } catch (err) {
      lastError.value = err.message;
      status.value = "disconnected";
    }
  };

  // ─── Disconnect ────────────────────────────────────────
  const disconnect = () => {
    intentionalClose = true;
    stopHeartbeat();

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    if (socket) {
      socket.close();
      socket = null;
    }

    status.value = "disconnected";
    reconnectAttempts.value = 0;
  };

  // ─── Send Message ──────────────────────────────────────
  const send = (data) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = typeof data === "string" ? data : JSON.stringify(data);
      socket.send(message);
      return true;
    }
    return false;
  };

  // ─── Subscription System ───────────────────────────────
  const subscribe = (eventName, callback) => {
    if (!subscribers.has(eventName)) {
      subscribers.set(eventName, new Set());
    }
    subscribers.get(eventName).add(callback);

    // Return cleanup unsubscribe function
    return () => unsubscribe(eventName, callback);
  };

  const unsubscribe = (eventName, callback) => {
    if (subscribers.has(eventName)) {
      subscribers.get(eventName).delete(callback);
      if (subscribers.get(eventName).size === 0) {
        subscribers.delete(eventName);
      }
    }
  };

  const emit = (eventName, data) => {
    if (subscribers.has(eventName)) {
      subscribers.get(eventName).forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`[WS error in subscriber for ${eventName}]:`, e);
        }
      });
    }
  };

  return {
    status,
    isConnected,
    isReconnecting,
    lastHeartbeat,
    reconnectAttempts,
    lastError,
    connect,
    disconnect,
    send,
    subscribe,
    unsubscribe,
  };
});
