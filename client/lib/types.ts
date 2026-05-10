/** A single message in the chat thread. */
export interface Message {
  role: "user" | "assistant";
  content: string;
}

/** Upload state shared between FileUpload and Chat. */
export interface UploadedFile {
  /** Original filename — used as the document identifier for RAG queries. */
  fileId: string;
  /** Display name shown in the UI. */
  name: string;
}
