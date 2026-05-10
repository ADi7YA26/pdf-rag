import { Router } from "express";
import { askQuestion } from "../controllers/chat.controller.js";

const router = Router();

/**
 * POST /chat/ask
 * Body: { query: string, fileId: string }
 */
router.post("/ask", askQuestion);

export default router;
