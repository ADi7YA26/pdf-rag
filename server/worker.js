import "dotenv/config";
import { Worker } from "bullmq";
import Redis from "ioredis";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OllamaEmbeddings } from "@langchain/ollama";
import { OpenAIEmbeddings } from "@langchain/openai";
import config from "./config/index.js";

// ─── Redis / Valkey Connection ────────────────────────────────────────────────
const connection = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  maxRetriesPerRequest: null,
});

// ─── Embeddings ───────────────────────────────────────────────────────────────
const embeddings = config.useLocal
  ? new OllamaEmbeddings({
    model: config.ollama.embeddingModel,
    baseUrl: config.ollama.baseUrl,
  })
  : new OpenAIEmbeddings({
    openAIApiKey: config.openai.apiKey,
  });

// ─── Job Processor ────────────────────────────────────────────────────────────
/**
 * Process a single PDF job:
 *  1. Load the PDF from disk
 *  2. Split into overlapping chunks
 *  3. Attach metadata (fileId, userId) for per-document filtering
 *  4. Upsert into Qdrant
 */
const processPdfJob = async (job) => {
  const { filePath, fileId, userId } = job.data;

  console.log(`[worker] Processing job ${job.id} — file: ${fileId}`);

  // Load PDF
  const loader = new PDFLoader(filePath);
  const rawDocs = await loader.load();

  // Split into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const docs = await splitter.splitDocuments(rawDocs);

  // Attach metadata for Qdrant filtering
  const docsWithMetadata = docs.map((doc) => ({
    ...doc,
    metadata: { ...doc.metadata, fileId, userId },
  }));

  await QdrantVectorStore.fromDocuments(docsWithMetadata, embeddings, {
    url: config.qdrant.url,
    collectionName: config.qdrant.collectionName,
  });

  console.log(`[worker] Successfully indexed file: ${fileId}`);
  return { status: "completed", fileId };
};

// ─── Worker ───────────────────────────────────────────────────────────────────
const worker = new Worker("pdf-queue", processPdfJob, {
  connection,
  concurrency: 1, // Process one PDF at a time to manage CPU / rate limits
});

worker.on("completed", (job) => {
  console.log(`[worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] Job ${job?.id} failed: ${err.message}`);
});

console.log("[worker] Running and waiting for jobs...");
