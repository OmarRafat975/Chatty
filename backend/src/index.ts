import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./routes/authRoutes";
import messagesRouter from "./routes/messagesRoutes";
import { Request, Response } from "express-serve-static-core";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { initWSS } from "./webSocketServer";
import { WSAuth } from "./controllers/webSocketsController";

dotenv.config();

const app = express();

const frontendURL = process.env.FRONT_URL;
const mongodbURI = process.env.DATABASE;
const port = process.env.PORT || 5050;

const startServer = async () => {
  try {
    if (!frontendURL || !mongodbURI) {
      throw new Error("Some of the Environment Variables are not defined");
    }
    await mongoose.connect(mongodbURI);
    console.log("MongoDB connected");

    app.use("/uploads", express.static(__dirname + "/uploads"));
    app.use(express.json());
    app.use(cookieParser());
    app.use(morgan("dev"));

    app.use(
      cors({
        credentials: true,
        origin: [frontendURL, "http://127.0.0.1:5173"],
      })
    );
    // app.options(/.*/, cors());

    app.get("/", (req: Request, res: Response) => {
      res.json("Hi from server");
    });

    app.use("/users", userRouter);
    app.use("/messages", messagesRouter);

    const server = app.listen(port, () => {
      console.log("Server Started on port 3000...");
    });

    const WSS = initWSS(server);
    WSS.on("connection", WSAuth);
  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
};

startServer();
