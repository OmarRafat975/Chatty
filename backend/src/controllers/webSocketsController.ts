import { IncomingMessage } from "http";
import jwt, { JwtPayload } from "jsonwebtoken";
import { WebSocket, WebSocketServer } from "ws";
import { getWSS } from "../webSocketServer";
import Message from "../models/Message";
import fs from "fs";

interface AuthedWebSocket extends WebSocket {
  userId?: string;
  name?: string;
  isAlive?: boolean;
  timer?: NodeJS.Timeout;
  diffTimer?: NodeJS.Timeout;
}

interface MessageData {
  recipient: string;
  message: string;
  file?: { name: string; data: string | ArrayBuffer | null };
}

function notifyAboutOnlineUsers(WSS: WebSocketServer) {
  [...WSS.clients].forEach((client: AuthedWebSocket) => {
    client.send(
      JSON.stringify({
        online: [...WSS.clients].map((client: AuthedWebSocket) => ({
          userId: client.userId,
          name: client.name,
        })),
      })
    );
  });
}

export function WSAuth(connection: AuthedWebSocket, req: IncomingMessage) {
  const WSS = getWSS();

  connection.isAlive = true;

  if (connection.isAlive)
    connection.timer = setInterval(() => {
      connection.ping();
      connection.diffTimer = setTimeout(() => {
        connection.isAlive = false;
        clearInterval(connection.timer);
        connection.terminate();
        notifyAboutOnlineUsers(WSS);
        console.log("dead");
      }, 1000);
    }, 50000);

  connection.on("pong", () => {
    clearTimeout(connection.diffTimer);
  });

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret)
    throw Error("JWT_SECRET is not defined in the environment variables");
  const cookies = req.headers.cookie;

  const token = cookies
    ?.split(";")
    ?.find((cookie) => cookie.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    connection.close(4001, "Missing auth token or deviceId");
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    connection.userId = decoded.userId;
    connection.name = decoded.name;
  } catch (err) {
    connection.close(4002, "Invalid or expired token");
  }

  connection.on("message", async (message) => {
    const messageData: MessageData = JSON.parse(message.toString());
    let filename = null;
    if (messageData.file) {
      const nameParts = messageData.file.name.split(".");
      const ext = nameParts[nameParts.length - 1];
      filename = Date.now() + nameParts.join("-") + `.${ext}`;
      const path = __dirname + "/.." + "/uploads/" + filename;

      const base64Data = (messageData.file.data as string).split(",")[1]; // Strip data URL header
      const bufferData = Buffer.from(base64Data, "base64");

      fs.writeFile(path, bufferData, () => {
        console.log("file saved: " + path);
      });
    }
    const sentMessage = await Message.create({
      sender: connection?.userId,
      recipient: messageData?.recipient,
      message: messageData.message,
      file: filename,
    });

    [...WSS.clients]
      .filter(
        (client: AuthedWebSocket) => client.userId === messageData?.recipient
      )
      .forEach((client) => client.send(JSON.stringify(sentMessage)));
  });

  notifyAboutOnlineUsers(WSS);
}
