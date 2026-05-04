import 'dotenv/config';
import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OllamaEmbeddings } from "@langchain/ollama"
import { OpenAIEmbeddings } from "@langchain/openai";


// Setup Valkey Connection
const connection = new Redis({
  host: process.env.VALKEY_HOST || '127.0.0.1',
  port: process.env.VALKEY_PORT || 6379,
  maxRetriesPerRequest: null,
});

// Initialize Embeddings
const embeddings = useLocal
  ? new OllamaEmbeddings({
    model: "nomic-embed-text", 
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  })
  : new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  })

// Define the processing logic
const processPdfJob = async (job) => {
  const { filePath, fileId, userId } = job.data;

  try {
    console.log(`Processing PDF for file: ${fileId}`);

    // Load PDF
    const loader = new PDFLoader(filePath);
    const rawDocs = await loader.load();

    // Split into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await splitter.splitDocuments(rawDocs);

    // Add metadata for Qdrant filtering
    const docsWithMetadata = docs.map(doc => ({
      ...doc,
      metadata: { ...doc.metadata, fileId, userId },
    }));

    await QdrantVectorStore.fromDocuments(docsWithMetadata, embeddings, {
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      collectionName: "pdf_documents",
    });

    console.log(`Successfully indexed file: ${fileId}`);
    return { status: 'completed', fileId };
  } catch (error) {
    console.error(`Error processing job ${job.id}:`, error);
    throw error; // Let BullMQ handle the retry
  }
};

// Initialize the Worker
const worker = new Worker('pdf-queue', processPdfJob, { 
  connection,
  concurrency: 1, // Process 1 PDFs at a time to manage CPU/Rate limits
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`Job ${job.id} has failed with ${err.message}`);
});

console.log('Worker is running and waiting for jobs...');