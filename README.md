# PDF Assistant

A full-stack RAG (Retrieval-Augmented Generation) application that lets you upload a PDF and ask natural-language questions about its contents.

```
┌─────────────────────────────────────────────────────────┐
│  Browser                                                │
│  Next.js 16 · React 19 · Tailwind CSS · Clerk auth      │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP
┌────────────────────▼────────────────────────────────────┐
│  Express 5 API server  (port 8000)                      │
│  /upload/pdf  →  multer  →  BullMQ job                  │
│  /chat/ask    →  Qdrant retriever  →  Ollama / OpenAI   │
└──────┬──────────────────────────┬───────────────────────┘
       │ BullMQ job               │ vector search
┌──────▼──────┐          ┌────────▼────────┐
│   Worker    │          │     Qdrant      │
│  PDF parse  │─────────▶│  vector store   │
│  + embed    │          └─────────────────┘
└──────┬──────┘
       │ queue
┌──────▼──────┐
│   Valkey    │  (Redis-compatible)
└─────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS v4 |
| Auth | Clerk |
| Backend | Node.js, Express 5 |
| Queue | BullMQ + Valkey (Redis-compatible) |
| Vector DB | Qdrant |
| Embeddings | Ollama (`nomic-embed-text`) or OpenAI |
| LLM | Ollama (`tinyllama`) or OpenAI |
| PDF parsing | LangChain `PDFLoader` + `RecursiveCharacterTextSplitter` |

---

## Project Structure

```
.
├── client/                     # Next.js frontend
│   ├── app/
│   │   ├── components/
│   │   │   ├── chat.tsx        # Chat panel
│   │   │   └── file-upload.tsx # Upload panel
│   │   ├── layout.tsx          # Root layout + Clerk provider
│   │   └── page.tsx            # Home page
│   ├── lib/
│   │   ├── api.ts              # Typed API client (all fetch calls)
│   │   ├── document-context.tsx# React context — shares active fileId
│   │   └── types.ts            # Shared TypeScript interfaces
│   ├── middleware.ts            # Clerk auth middleware
│   └── next.config.ts          # Next.js config (standalone + rewrites)
│
├── server/                     # Express API + BullMQ worker
│   ├── config/index.js         # Centralised env config
│   ├── controllers/
│   │   ├── chat.controller.js  # POST /chat/ask
│   │   └── upload.controller.js# POST /upload/pdf
│   ├── middleware/
│   │   ├── errorHandler.js     # Global error handler
│   │   ├── logger.js           # Request logger
│   │   └── upload.js           # Multer config (PDF-only, 50 MB)
│   ├── routes/
│   │   ├── chat.routes.js
│   │   └── upload.routes.js
│   ├── services/
│   │   ├── queue.service.js    # BullMQ queue + enqueueFile()
│   │   └── rag.service.js      # Embeddings, Qdrant, LLM chain
│   ├── utils/
│   │   ├── asyncHandler.js     # Eliminates try-catch in controllers
│   │   └── response.js         # sendSuccess() / sendError() helpers
│   ├── index.js                # App entry point
│   └── worker.js               # BullMQ PDF processing worker
│
├── docker-compose.yaml         # Full stack: infra + server + worker + client
└── .env.example                # Environment variable reference
```

---

## API

All responses follow a consistent shape:

```jsonc
// Success
{ "success": true, "data": { ... }, "message": "..." }

// Error
{ "success": false, "error": "ErrorName", "message": "Detailed message" }
```

### `POST /upload/pdf`

Upload a PDF for processing.

- **Body:** `multipart/form-data` with a `file` field (PDF only, max 50 MB)
- **Response `data`:** `{ fileId: string, filePath: string }`

### `POST /chat/ask`

Ask a question about an uploaded document.

- **Body:** `{ "query": "string", "fileId": "string" }`
- **Response `data`:** `{ answer: string, sources: DocumentChunk[] }`

---

## Getting Started

### Prerequisites

- [Node.js 22+](https://nodejs.org)
- [pnpm](https://pnpm.io) — `npm i -g pnpm`
- [Docker + Docker Compose](https://docs.docker.com/get-docker/)
- A [Clerk](https://clerk.com) account (free tier works)
- **For local LLM:** [Ollama](https://ollama.com) with `nomic-embed-text` and `tinyllama` pulled
- **For OpenAI:** an OpenAI API key

---

### Option A — Local development (recommended for dev)

**1. Start infrastructure**

```bash
docker compose up valkey qdrant -d
```

**2. Pull Ollama models** (skip if using OpenAI)

```bash
ollama pull nomic-embed-text
ollama pull tinyllama
```

**3. Configure the server**

```bash
cp .env.example server/.env
# Edit server/.env — the defaults work for local Ollama + Docker infra
```

**4. Install and run the server**

```bash
cd server
pnpm install
pnpm dev          # API server on :8000
```

**5. Run the worker** (separate terminal)

```bash
cd server
pnpm dev:worker
```

**6. Configure and run the client**

```bash
cp .env.example client/.env
# Edit client/.env — add your Clerk keys
cd client
pnpm install
pnpm dev          # Next.js on :3000
```

Open [http://localhost:3000](http://localhost:3000).

---

### Option B — Docker Compose (full stack)

**1. Create a root `.env` file**

```bash
cp .env.example .env
# Fill in NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY at minimum
```

**2. Start everything**

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API server | http://localhost:8000 |
| Qdrant dashboard | http://localhost:6333/dashboard |

> **Ollama on Linux with Docker:** replace `host.docker.internal` in `OLLAMA_BASE_URL` with your `docker0` bridge IP (usually `172.17.0.1`).

**3. Stop**

```bash
docker compose down          # keep volumes
docker compose down -v       # also delete stored data
```

---

### Using OpenAI instead of Ollama

Set the following in your `.env` (or `server/.env` for local dev):

```env
USE_LOCAL=false
OPENAI_API_KEY=sk-proj-...
```

---

## Environment Variables

### Server (`server/.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8000` | API server port |
| `VALKEY_HOST` | `127.0.0.1` | Redis/Valkey host (`valkey` in Docker) |
| `VALKEY_PORT` | `6379` | Redis/Valkey port |
| `QDRANT_URL` | `http://localhost:6333` | Qdrant URL (`http://qdrant:6333` in Docker) |
| `QDRANT_COLLECTION` | `pdf_documents` | Qdrant collection name |
| `USE_LOCAL` | `true` | `true` = Ollama, `false` = OpenAI |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama base URL |
| `OLLAMA_EMBEDDING_MODEL` | `nomic-embed-text` | Embedding model |
| `OLLAMA_CHAT_MODEL` | `tinyllama` | Chat/generation model |
| `OPENAI_API_KEY` | — | Required when `USE_LOCAL=false` |

### Client (`client/.env`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (from Clerk dashboard) |
| `CLERK_SECRET_KEY` | Clerk secret key (from Clerk dashboard) |
| `NEXT_PUBLIC_BACKEND_URL` | Backend URL seen by the browser (default `http://localhost:8000`) |

---

## How It Works

1. **Upload** — The user uploads a PDF. The server saves it to disk and pushes a job onto the BullMQ queue.
2. **Processing** — The worker picks up the job, loads the PDF with LangChain's `PDFLoader`, splits it into 1 000-token chunks with 200-token overlap, generates embeddings, and upserts them into Qdrant tagged with the `fileId`.
3. **Query** — When the user asks a question, the server retrieves the top-3 most relevant chunks from Qdrant (filtered by `fileId`), builds a prompt with the context, and streams the answer back from the LLM.
