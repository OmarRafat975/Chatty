import { Router } from "express";
import { getMessages } from "../controllers/messagesController";

const router = Router();

// /api/users
router.get("/:id", getMessages);

export default router;
