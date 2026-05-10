import { Router } from "express";
import upload from "../middleware/upload.js";
import { uploadPdf } from "../controllers/upload.controller.js";

const router = Router();

/**
 * POST /upload/pdf
 * Multipart form-data with a single field named "file".
 */
router.post("/pdf", upload.single("file"), uploadPdf);

export default router;
