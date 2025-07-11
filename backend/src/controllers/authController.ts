import { NextFunction, Request, Response } from "express-serve-static-core";
import User from "../models/User";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
      throw Error("JWT_SECRET is not defined in the environment variables");
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    const token = jwt.sign(
      { userId: user._id, name: user.username },
      jwtSecret
    );
    res
      .cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "none",
        secure: true,
      })
      .status(201)
      .json({
        status: "success",
        user: { id: user._id, name: user.username },
      });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next("Email and password are required");
    }

    const user = await User.findOne({ email: email });
    const validPassword = await bcrypt.compare(
      password,
      user?.password ||
        "$2b$10$WrYiYlLGu6MILgPrnH5ZruTw52gYj/qglmQ3sbhOB3kp3oEeZxJXO"
    );
    if (user && validPassword) {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret)
        throw Error("JWT_SECRET is not defined in the environment variables");
      const token = jwt.sign(
        { userId: user._id, name: user.username },
        jwtSecret
      );
      res
        .cookie("token", token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
          sameSite: "none",
          secure: true,
        })
        .status(201)
        .json({
          status: "success",
          user: { id: user._id, name: user.username },
        });
    } else {
      res
        .status(401)
        .json({ status: "faild", message: "SomeThing Went wrong" });
    }
  } catch (error) {
    next(error);
  }
}

export async function getMyInfo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
      throw Error("JWT_SECRET is not defined in the environment variables");
    const { token } = req.cookies;
    if (!token) {
      return next("no token provided");
    }

    jwt.verify(token, jwtSecret, {}, (err, decoded) => {
      if (err) throw err;
      res.status(201).json({
        status: "success",
        user: decoded,
      });
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    res
      .cookie("token", "", {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "none",
        secure: true,
      })
      .status(204)
      .json({});
  } catch (error) {
    next(error);
  }
}
