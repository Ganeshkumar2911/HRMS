import { io } from "socket.io-client";

class MatrixTicker {
  constructor({ token = "", reconnect = true, max_retry = 50, max_delay = 60 } = {}) {
    this.root = this.resolveWsUrl();
    this.token = token;

    this.auto_reconnect = reconnect;
    this.reconnect_max_tries = max_retry;
    this.reconnect_max_delay = max_delay;

    this.ws = null;
    this.triggers = {};

    this.current_reconnection_count = 0;
    this.last_reconnect_interval = 0;

    this.activeChatCustomerId = null;
    this.isRoomJoined = false;

    this.connect();
  }

  /* ---------------- Utility ---------------- */
  resolveWsUrl() {
    if (typeof window === "undefined") return "https://admin.panthercapitals.com/";

    const isProdDomain = window.location.hostname === "admin.panthercapitals.com";
    const customBaseUrl = localStorage.getItem("custom_base_url");

    let customWsUrl = null;
    if (customBaseUrl) {
      customWsUrl = customBaseUrl.trim().replace(/\/admin\/?$/, "");
      if (!customWsUrl.endsWith("/")) {
        customWsUrl += "/";
      }
    }

    const prodUrl = "https://admin.panthercapitals.com/";
    const devUrl = import.meta.env?.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace("/admin", "") 
      : prodUrl;

    return customWsUrl || (isProdDomain ? prodUrl : devUrl);
  }

  /* ---------------- Connect ---------------- */
  connect() {
    if (this.ws) return;

    const currentToken =
      this.token ||
      (typeof window !== "undefined" ? localStorage.getItem("accessToken") : "") ||
      "";

    const cleanRoot = this.root.replace(/\/+$/, "");
    console.log(`[MatrixTicker] Connecting to WebSocket: ${cleanRoot}`);

    this.ws = io(cleanRoot, {
      path: "/socket.io",
      auth: { token: currentToken },
      query: { token: currentToken },
      transports: ["websocket", "polling"],
      reconnection: false,
    });

    this.ws.on("connect", () => {
      console.log("[MatrixTicker] Socket connected successfully! ID:", this.ws.id);
      this.current_reconnection_count = 0;

      if (this.activeChatCustomerId) {
        this.ws.emit("join_chat", { dtCustomerId: this.activeChatCustomerId });
        this.ws.emit("join_customer_chat", { dtCustomerId: this.activeChatCustomerId });
        console.log("[MatrixTicker] Auto-joined active chat room:", this.activeChatCustomerId);
      }

      this.trigger("connect");
    });

    this.ws.on("disconnect", (reason) => {
      console.warn("[MatrixTicker] Socket disconnected:", reason);
      this.trigger("disconnect", [reason]);

      if (this.auto_reconnect) {
        this.reconnect();
      }
    });

    this.ws.on("connect_error", (err) => {
      console.error("[MatrixTicker] Socket connect_error:", err.message || err);
      this.trigger("error", [err]);
    });

    // Dynamically proxy all socket.io events to our internal triggers
    this.ws.onAny((event, ...args) => {
      this.trigger(event, args);
    });
  }

  /* ---------------- Disconnect ---------------- */
  disconnect() {
    if (!this.ws) return;

    this.auto_reconnect = false;
    this.ws.disconnect();
    this.ws = null;
  }

  /* ---------------- Event Binding ---------------- */
  on(event, callback) {
    if (!this.triggers[event]) {
      this.triggers[event] = [];
    }
    this.triggers[event].push(callback);
  }

  off(event, callback) {
    if (!this.triggers[event]) return;
    
    if (!callback) {
      delete this.triggers[event];
      return;
    }
    
    this.triggers[event] = this.triggers[event].filter((cb) => cb !== callback);
  }

  trigger(event, args = []) {
    this.triggers[event]?.forEach((cb) => cb(...args));
  }

  /* ---------------- WhatsApp Chat Room ---------------- */
  joinChat(dtCustomerId) {
    if (!dtCustomerId) return;
    if (this.activeChatCustomerId === dtCustomerId && this.isRoomJoined) return;

    this.activeChatCustomerId = dtCustomerId;
    
    if (this.ws) {
      this.ws.emit("join_chat", { dtCustomerId });
      this.ws.emit("join_customer_chat", { dtCustomerId });
      this.isRoomJoined = true;
      console.log("[MatrixTicker] Joined chat room:", dtCustomerId);
    }
  }

  leaveChat(dtCustomerId) {
    if (this.activeChatCustomerId === dtCustomerId || !dtCustomerId) {
      this.activeChatCustomerId = null;
      this.isRoomJoined = false;
    }
    
    if (this.ws && dtCustomerId) {
      this.ws.emit("leave_chat", { dtCustomerId });
      this.ws.emit("leave_customer_chat", { dtCustomerId });
      console.log("[MatrixTicker] Left chat room:", dtCustomerId);
    }
  }

  /* ---------------- Subscriptions ---------------- */
  subscribe(symbols, id) {
    if (this.ws && symbols?.length > 0) {
      this.ws.emit("subscribe_symbol", {
        symbol: symbols,
        user_id: id,
      });
    }
  }

  unsubscribe(symbols, id) {
    if (this.ws) {
      this.ws.emit("unsubscribe", {
        symbol: symbols,
        user_id: id,
      });
    }
  }

  /* ---------------- Reconnect ---------------- */
  reconnect() {
    if (this.current_reconnection_count >= this.reconnect_max_tries) {
      console.error("[MatrixTicker] Max reconnection attempts reached.");
      return;
    }

    this.last_reconnect_interval = Math.min(
      2 ** this.current_reconnection_count,
      this.reconnect_max_delay
    );

    this.current_reconnection_count++;

    console.log(`[MatrixTicker] Reconnecting in ${this.last_reconnect_interval}s...`);

    setTimeout(() => {
      this.connect();
    }, this.last_reconnect_interval * 1000);
  }
}

export default MatrixTicker;

