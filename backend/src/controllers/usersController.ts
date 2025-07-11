import { NextFunction, Request, Response } from "express-serve-static-core";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";

export async function addFriend(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
      throw Error("JWT_SECRET is not defined in the environment variables");

    const { userId } = (await jwt.verify(
      req.cookies.token,
      jwtSecret
    )) as JwtPayload;
    const { id } = req.params;

    const myInfo = await User.findById(userId);
    const user = await User.findById(id);

    if (user && myInfo && userId !== id) {
      const newPendingList = Array.from(
        new Map(
          [
            ...myInfo.requests,
            { userId: id, name: user.username, email: user.email },
          ]?.map((user) => [user.userId, user])
        ).values()
      );

      const userRequestsList = Array.from(
        new Map(
          [
            ...user.requests,
            { userId: myInfo.id, name: myInfo.username, email: myInfo.email },
          ]?.map((user) => [user.userId, user])
        ).values()
      );

      await User.findByIdAndUpdate(userId, {
        pending: newPendingList,
      });
      await User.findByIdAndUpdate(id, {
        requests: userRequestsList,
      });

      res
        .status(200)
        .json({ friends: { pending: [...newPendingList] }, status: "success" });
    }
  } catch (error) {
    next(error);
  }
}

export async function getMyFriends(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
      throw Error("JWT_SECRET is not defined in the environment variables");

    const { userId } = (await jwt.verify(
      req.cookies.token,
      jwtSecret
    )) as JwtPayload;

    const user = await User.findById(userId);

    const friends = user?.friends;
    const pending = user?.pending;
    const requests = user?.requests;

    res.status(200).json({ friends, pending, requests, status: "success" });
  } catch (error) {
    next(error);
  }
}

export async function searchUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { searchText } = req.query;
  try {
    if (searchText) {
      const users = await User.aggregate([
        {
          $search: {
            index: "users", // or the name of your custom index
            text: {
              query: searchText,
              path: ["email", "username"],
              fuzzy: { maxEdits: 1 }, // typo-tolerance
            },
          },
        },
        {
          $project: {
            _id: 1,
            username: 1,
            email: 1,
          },
        },
      ]);

      res.status(200).json({ users, status: "success" });
    } else {
      next("error in search");
    }
  } catch (error) {
    console.error("Search error", error);
  }
}

export async function acceptRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
      throw Error("JWT_SECRET is not defined in the environment variables");

    const { userId } = (await jwt.verify(
      req.cookies.token,
      jwtSecret
    )) as JwtPayload;
    const { id } = req.params;

    const myInfo = await User.findById(userId);
    const user = await User.findById(id);

    if (user && myInfo && userId !== id) {
      const newPendingList = user.pending.filter(
        (pendingUser) => pendingUser.userId !== userId
      );
      const newRequestList = myInfo.requests.filter(
        (requestUser) => requestUser.userId !== id
      );

      const userFriendList = Array.from(
        new Map(
          [
            ...user.friends,
            { userId: myInfo._id, name: myInfo.username, email: myInfo.email },
          ]?.map((user) => [user.userId, user])
        ).values()
      );

      const myFriendList = Array.from(
        new Map(
          [
            ...myInfo.friends,
            { userId: user._id, name: user.username, email: user.email },
          ]?.map((user) => [user.userId, user])
        ).values()
      );

      await User.findByIdAndUpdate(userId, {
        requests: newRequestList,
        friends: myFriendList,
      });
      await User.findByIdAndUpdate(id, {
        pending: newPendingList,
        friends: userFriendList,
      });

      res.status(200).json({
        friends: { friends: myFriendList, requests: newRequestList },
        status: "success",
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function removeRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
      throw Error("JWT_SECRET is not defined in the environment variables");

    const { userId } = (await jwt.verify(
      req.cookies.token,
      jwtSecret
    )) as JwtPayload;
    const { id } = req.params;

    const myInfo = await User.findById(userId);
    const user = await User.findById(id);

    if (user && myInfo && userId !== id) {
      const newPendingList = user.pending.filter(
        (pendingUser) => pendingUser.userId !== userId
      );
      const newRequestList = myInfo.requests.filter(
        (requestUser) => requestUser.userId !== id
      );

      await User.findByIdAndUpdate(userId, {
        requests: newRequestList,
      });
      await User.findByIdAndUpdate(id, {
        pending: newPendingList,
      });

      res.status(200).json({
        friends: { requests: newRequestList },
        status: "success",
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function removeSentRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
      throw Error("JWT_SECRET is not defined in the environment variables");

    const { userId } = (await jwt.verify(
      req.cookies.token,
      jwtSecret
    )) as JwtPayload;
    const { id } = req.params;

    const myInfo = await User.findById(userId);
    const user = await User.findById(id);

    if (user && myInfo && userId !== id) {
      const newPendingList = myInfo.pending.filter(
        (pendingUser) => pendingUser.userId !== id
      );
      const newRequestList = user.requests.filter(
        (requestUser) => requestUser.userId !== userId
      );

      await User.findByIdAndUpdate(userId, {
        pending: newPendingList,
      });
      await User.findByIdAndUpdate(id, {
        requests: newRequestList,
      });

      res.status(200).json({
        friends: { pending: newPendingList },
        status: "success",
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function removeFriend(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
      throw Error("JWT_SECRET is not defined in the environment variables");

    const { userId } = (await jwt.verify(
      req.cookies.token,
      jwtSecret
    )) as JwtPayload;
    const { id } = req.params;

    const myInfo = await User.findById(userId);
    const user = await User.findById(id);

    if (user && myInfo && userId !== id) {
      const newFriendList = myInfo.friends.filter(
        (friend) => friend.userId !== id
      );
      const newUserFriendList = user.friends.filter(
        (friend) => friend.userId !== userId
      );

      await User.findByIdAndUpdate(userId, {
        friends: newUserFriendList,
      });
      await User.findByIdAndUpdate(id, {
        friends: newUserFriendList,
      });

      res.status(200).json({
        friends: { friends: newFriendList },
        status: "success",
      });
    }
  } catch (error) {
    next(error);
  }
}
