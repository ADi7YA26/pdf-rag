import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from 'bullmq';

const app = express();
const PORT = 8000;

// 1. BullMQ requires a Redis connection configuration
const connection = {
  host: 'localhost',
  port: 6379
};

// 2. Initialize the queue with the connection
const fileQueue = new Queue('pdf-queue');

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

    // 3. Pass the object directly (no need for JSON.stringify)
    await fileQueue.add('file-ready', {
      fileId: req.file.originalname,
      filePath: req.file.path,
      userId: req.userId || 1,
    });

    return res.json({ message: "File uploaded and queued for processing" });
  } catch (error) {
    console.error("Queue Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});