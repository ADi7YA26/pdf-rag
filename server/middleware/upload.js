import multer from "multer";
import path from "path";

/**
 * Multer disk storage configuration.
 * Files are saved to the /uploads directory with a unique prefix.
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${uniquePrefix}-${file.originalname}`);
  },
});

/**
 * File filter — only allow PDF uploads.
 */
const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== ".pdf" || file.mimetype !== "application/pdf") {
    const err = new Error("Only PDF files are allowed");
    err.statusCode = 400;
    err.name = "ValidationError";
    return cb(err, false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});

export default upload;
