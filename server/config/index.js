import "dotenv/config";

const config = {
  port: parseInt(process.env.PORT, 10) || 8000,

  useLocal: process.env.USE_LOCAL === "true",

  redis: {
    host: process.env.VALKEY_HOST || "127.0.0.1",
    port: parseInt(process.env.VALKEY_PORT, 10) || 6379,
  },

  qdrant: {
    url: process.env.QDRANT_URL || "http://localhost:6333",
    collectionName: process.env.QDRANT_COLLECTION || "pdf_documents",
  },

  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text",
    chatModel: process.env.OLLAMA_CHAT_MODEL || "tinyllama",
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
};

export default config;
