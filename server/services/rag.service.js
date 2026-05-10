import { OllamaEmbeddings, ChatOllama } from "@langchain/ollama";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import config from "../config/index.js";

/**
 * Build the appropriate embeddings instance based on config.
 */
const buildEmbeddings = () => {
  if (config.useLocal) {
    return new OllamaEmbeddings({
      model: config.ollama.embeddingModel,
      baseUrl: config.ollama.baseUrl,
    });
  }
  return new OpenAIEmbeddings({
    openAIApiKey: config.openai.apiKey,
  });
};

/**
 * Build the chat LLM instance.
 */
const buildLLM = () =>
  new ChatOllama({
    model: config.ollama.chatModel,
    temperature: 0,
    baseUrl: config.ollama.baseUrl,
  });

/**
 * Run a RAG query against a specific document.
 */
export const queryDocument = async ({ query, fileId }) => {
  const embeddings = buildEmbeddings();
  const llm = buildLLM();

  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: config.qdrant.url,
    collectionName: config.qdrant.collectionName,
  });

  const retriever = vectorStore.asRetriever({
    filter: {
      must: [{ key: "metadata.fileId", match: { value: fileId } }],
    },
    k: 3,
  });

  const docs = await retriever.invoke(query);
  const context = docs.map((doc) => doc.pageContent).join("\n\n");

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a PDF assistant.

Answer ONLY from the provided context.

If the answer is not present in the context, say:
"I could not find the answer in the document."

Context:
{context}`,
    ],
    ["human", "{input}"],
  ]);

  const chain = prompt.pipe(llm);

  const response = await chain.invoke({ context, input: query });

  return {
    answer: response.content,
    sources: docs,
  };
};
