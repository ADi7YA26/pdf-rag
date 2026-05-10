import { enqueueFile } from "../services/queue.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * POST /upload/pdf
 * Accepts a single PDF file, saves it to disk, and enqueues it for processing.
 */
export const uploadPdf = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, "ValidationError", "No file uploaded", 400);
  }

  const { originalname: fileId, path: filePath } = req.file;
  const userId = req.auth?.userId || req.headers["x-user-id"] || "anonymous";

  await enqueueFile({ fileId, filePath, userId });

  return sendSuccess(
    res,
    { fileId, filePath },
    "File uploaded and queued for processing",
    201
  );
});
