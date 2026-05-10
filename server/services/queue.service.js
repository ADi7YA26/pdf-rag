import { Queue } from "bullmq";
import config from "../config/index.js";

/**
 * BullMQ queue for PDF processing jobs.
 * The worker (worker.js) consumes jobs from this queue.
 */
const fileQueue = new Queue("pdf-queue", {
  connection: {
    host: config.redis.host,
    port: config.redis.port,
  },
});

/**
 * Add a PDF processing job to the queue.
 */
export const enqueueFile = async ({ fileId, filePath, userId }) => {
  const job = await fileQueue.add("file-ready", { fileId, filePath, userId });
  return job;
};

export default fileQueue;
