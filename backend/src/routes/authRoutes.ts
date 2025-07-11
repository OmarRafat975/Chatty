import { Router } from "express";
import {
  getMyInfo,
  login,
  logout,
  register,
} from "../controllers/authController";
import {
  acceptRequest,
  addFriend,
  getMyFriends,
  removeFriend,
  removeRequest,
  removeSentRequest,
  searchUsers,
} from "../controllers/usersController";

const router = Router();

// /api/users
router
  .post("/register", register)
  .post("/login", login)
  .get("/profile", getMyInfo)
  .get("/friend/add/:id", addFriend)
  .get("/friends", getMyFriends)
  .get("/find", searchUsers)
  .get("/logout", logout)
  .get("/friend/accept/:id", acceptRequest)
  .get("/friend/request/:id", removeRequest)
  .get("/friend/remove/:id", removeFriend)
  .get("/friend/request/sent/:id", removeSentRequest);

export default router;
