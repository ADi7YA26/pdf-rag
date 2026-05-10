import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from 'bullmq';
import { OllamaEmbeddings, ChatOllama } from '@langchain/ollama';
import { QdrantVectorStore } from "@langchain/qdrant";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const app = express();
const PORT = 8000;

// 1. BullMQ requires a Redis connection configuration
const connection = {
  host: 'localhost',
  port: 6379
};

// 2. Initialize the queue with the connection
const fileQueue = new Queue('pdf-queue', {connection});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const uniqueSuffix = 'x';
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
const upload = multer({ storage: storage });

// Logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} : ${req.path}`);
  next();
});

app.get('/', (req, res) => {
  return res.json('All good');
});

app.post('/upload/pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("file: ", req.file)
    console.log("fileId -> ", req.file.originalname)
    // await fileQueue.add('file-ready', {
    //   fileId: req.file.originalname,
    //   filePath: req.file.path,
    //   userId: req.userId || 1,
    // });

    return res.json({ message: "File uploaded and queued for processing" });
  } catch (error) {
    console.error("Queue Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/ask', async (req, res) => {
  console.log(req.auth)
  const { query, fileId } = req.body;

  try {
    const embeddings = new OllamaEmbeddings({
      model: "nomic-embed-text",
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    })

    const llm = new ChatOllama({
      model: "tinyllama", // The model used for generation
      temperature: 0,
      baseUrl: process.env.OLLAMA_URL || "http://localhost:11434",
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: process.env.QDRANT_URL || "http://localhost:6333",
      collectionName: "pdf_documents",
    });

    console.log('fileID: ', fileId)
    const retriever = vectorStore.asRetriever({
      filter: {
        must: [{ key: "metadata.fileId", match: { value: fileId } }],
      },
      k: 3, // Top 3 relevant chunks
    });

    const docs = await retriever.invoke(query)

    const context = docs.map(doc => doc.pageContent).join("\n\n");

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `
    You are a PDF assistant.

    Answer ONLY from the provided context.

    If the answer is not present in the context, say:
    "I could not find the answer in the document."

    Context:
    {context}
    `,
      ],
      ["human", "{input}"],
    ]);

    const chain = prompt.pipe(llm);

    const response = await chain.invoke({
      context,
      input: query,
    });

    return res.json({
      answer: response.content,
      sources: docs,
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      status: 'FAILURE',
      message: err?.message || 'Failed to get response'
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});