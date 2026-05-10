/**
 * Centralised API client.
 * All fetch calls go through here so the base URL and headers
 * are never duplicated across components.
 */

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// ─── Response shape from the server ──────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Typed fetch wrapper ──────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiSuccess<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      // Don't set Content-Type for FormData — browser sets it with boundary
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  const json: ApiResponse<T> = await res.json();

  if (!json.success) {
    // Throw a plain Error so callers can catch it normally
    throw new Error(json.message || "An unexpected error occurred");
  }

  return json;
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface UploadResponse {
  fileId: string;
  filePath: string;
}

export async function uploadPdf(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiFetch<UploadResponse>("/upload/pdf", {
    method: "POST",
    body: formData,
  });

  return res.data;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface AskResponse {
  answer: string;
  sources: Array<{
    pageContent: string;
    metadata: Record<string, unknown>;
  }>;
}

export async function askQuestion(
  query: string,
  fileId: string
): Promise<AskResponse> {
  const res = await apiFetch<AskResponse>("/chat/ask", {
    method: "POST",
    body: JSON.stringify({ query, fileId }),
  });

  return res.data;
}
