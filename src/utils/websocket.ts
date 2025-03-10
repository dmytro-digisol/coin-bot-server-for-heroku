import WebSocket from "ws";

export let wss: WebSocket.Server;
export let pumpfunWebSocket: WebSocket;
let pumpfunMessageHandler: ((data: any) => void) | null = null;
let pumpfunTokenTradeMessageHandler: ((data: any) => void) | null = null;

const TX_TYPE_CREATE = "create";
const TX_TYPE_BUY = "buy";
const TX_TYPE_SELL = "sell";

export function initWebSocket(server: any) {
  wss = new WebSocket.Server({ server });
}

export function broadcastMessage(message: string) {
  if (!wss) return;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export function initPumpfunWebSocket() {
  pumpfunWebSocket = new WebSocket("wss://pumpportal.fun/api/data");
}

export function subscribeToPumpfunData(
  onTokenCreated: (tokenData: any) => void
) {
  const ws = pumpfunWebSocket;

  const payload = {
    method: "subscribeNewToken",
  };

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  } else {
    ws.on("open", function open() {
      ws.send(JSON.stringify(payload));
    });
  }

  if (pumpfunMessageHandler) {
    ws.off("message", pumpfunMessageHandler);
  }

  pumpfunMessageHandler = function message(data: any) {
    const parsed = JSON.parse(data);

    if (parsed.txType === TX_TYPE_CREATE) {
      console.log("[Pumpfun] Received:", parsed);

      onTokenCreated(parsed);
    }
  };

  ws.on("message", pumpfunMessageHandler);
}

export function unsubscribeFromPumpfunData() {
  const ws = pumpfunWebSocket;

  console.log("[Pumpfun] Unsubscribing from new token events");

  const payload = {
    method: "unsubscribeNewToken",
  };

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  } else {
    ws.on("open", function open() {
      ws.send(JSON.stringify(payload));
    });
  }

  if (pumpfunMessageHandler) {
    ws.off("message", pumpfunMessageHandler);
    pumpfunMessageHandler = null;
  }
}

export function subscribeToPumpfunTokenTrade(
  keysArray: string[],
  onTokenTrade: (tokenData: any) => void
) {
  const ws = pumpfunWebSocket;

  const payload = {
    method: "subscribeAccountTrade",
    keys: keysArray,
  };

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  } else {
    ws.on("open", function open() {
      ws.send(JSON.stringify(payload));
    });
  }

  if (pumpfunTokenTradeMessageHandler) {
    ws.off("message", pumpfunTokenTradeMessageHandler);
  }

  pumpfunTokenTradeMessageHandler = function message(data: any) {
    const parsed = JSON.parse(data);

    if (parsed.txType === TX_TYPE_BUY || parsed.txType === TX_TYPE_SELL) {
      console.log("[Pumpfun] Token Trade Received:", parsed);

      onTokenTrade(parsed);
    }
  };

  ws.on("message", pumpfunTokenTradeMessageHandler);
}

export function unsubscribeFromPumpfunTokenTrade(keysArray: string[]) {
  const ws = pumpfunWebSocket;

  console.log(
    "[Pumpfun] Unsubscribing from token trade events for keys:",
    keysArray
  );

  const payload = {
    method: "unsubscribeTokenTrade",
    keys: keysArray,
  };

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  } else {
    ws.on("open", function open() {
      ws.send(JSON.stringify(payload));
    });
  }

  if (pumpfunTokenTradeMessageHandler) {
    ws.off("message", pumpfunTokenTradeMessageHandler);
    pumpfunTokenTradeMessageHandler = null;
  }
}
