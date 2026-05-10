"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { uploadPdf } from "@/lib/api";
import { useDocument } from "@/lib/document-context";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function FileUploadComponent() {
  const { setUploadedFile, uploadedFile } = useDocument();

  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const selectFile = (file: File) => {
    if (file.type !== "application/pdf") {
      setErrorMsg("Only PDF files are supported.");
      setStatus("error");
      return;
    }
    setErrorMsg(null);
    setStatus("idle");
    setPendingFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) selectFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) selectFile(file);
  };

  const handleUpload = async () => {
    if (!pendingFile) return;

    setStatus("uploading");
    setErrorMsg(null);

    try {
      const data = await uploadPdf(pendingFile);
      setUploadedFile({ fileId: data.fileId, name: pendingFile.name });
      setStatus("success");
      setPendingFile(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setErrorMsg(null);
    setPendingFile(null);
    setUploadedFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-2xl border border-gray-200 shadow-sm bg-white">
        <h2 className="text-xl font-medium text-gray-800 mb-1">Upload PDF</h2>
        <p className="text-sm text-gray-400 mb-6">
          Upload a document to start asking questions about it.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${
            dragOver
              ? "border-gray-500 bg-gray-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <UploadCloud className="w-8 h-8 text-gray-400" />
          <p className="text-sm text-gray-500">Click to upload or drag &amp; drop</p>
          <p className="text-xs text-gray-400">PDF only · max 50 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Pending file */}
        {pendingFile && status !== "success" && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
            <FileText className="w-4 h-4 shrink-0 text-gray-400" />
            <span className="truncate flex-1">{pendingFile.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Remove file"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Success state */}
        {status === "success" && uploadedFile && (
          <div className="mt-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="truncate flex-1">{uploadedFile.name}</span>
            <button
              onClick={handleReset}
              className="text-green-500 hover:text-green-700 transition-colors"
              aria-label="Upload another file"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error message */}
        {status === "error" && errorMsg && (
          <p className="mt-3 text-xs text-red-500 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 shrink-0" />
            {errorMsg}
          </p>
        )}

        {/* Upload button */}
        {status !== "success" && (
          <button
            onClick={handleUpload}
            disabled={!pendingFile || status === "uploading"}
            className="w-full mt-6 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-900 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === "uploading" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading…
              </>
            ) : (
              "Upload"
            )}
          </button>
        )}

        {status === "success" && (
          <button
            onClick={handleReset}
            className="w-full mt-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
          >
            Upload another file
          </button>
        )}
      </div>
    </div>
  );
}
