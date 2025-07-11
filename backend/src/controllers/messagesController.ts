import { NextFunction, Request, Response } from "express-serve-static-core";
import Message from "../models/Message";
import jwt, { JwtPayload } from "jsonwebtoken";

export async function getMessages(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
      throw Error("JWT_SECRET is not defined in the environment variables");

    const { id } = req.params;
    const { userId } = (await jwt.verify(
      req.cookies.token,
      jwtSecret
    )) as JwtPayload;

    const messages = await Message.find({
      sender: { $in: [userId, id] },
      recipient: { $in: [userId, id] },
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {}
}
