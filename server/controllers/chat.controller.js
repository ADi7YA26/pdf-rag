import { queryDocument } from "../services/rag.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * POST /chat/ask
 * Accepts a query and a fileId, runs RAG against the indexed document,
 * and returns the LLM answer along with source chunks.
 */
export const askQuestion = asyncHandler(async (req, res) => {
  const { query, fileId } = req.body;

  if (!query || typeof query !== "string" || query.trim() === "") {
    return sendError(res, "ValidationError", "query is required and must be a non-empty string", 400);
  }

  if (!fileId || typeof fileId !== "string" || fileId.trim() === "") {
    return sendError(res, "ValidationError", "fileId is required and must be a non-empty string", 400);
  }

  const result = await queryDocument({ query: query.trim(), fileId: fileId.trim() });

  return sendSuccess(res, result, "Query answered successfully");
});
