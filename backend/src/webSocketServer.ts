import { WebSocketServer } from "ws";

let WSS: WebSocketServer;

export const initWSS = (server: any) => {
  WSS = new WebSocketServer({ server });
  return WSS;
};

export const getWSS = () => {
  if (!WSS) {
    throw new Error("WSS not initialized");
  }
  return WSS;
};
