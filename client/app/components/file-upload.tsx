"use client";

import { useState } from "react";

export default function FileUploadComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/upload/pdf", {
        method: "POST",
        body: formData,
      });

      alert("File uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-2xl border border-gray-200 shadow-sm bg-white">
        <h2 className="text-xl font-medium text-gray-800 mb-6">Upload PDF</h2>

        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-gray-400 transition">
          <span className="text-sm text-gray-500">
            Click to upload or drag & drop
          </span>
          <span className="text-xs text-gray-400 mt-1">PDF only</span>

          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {file && (
          <div className="mt-4 text-sm text-gray-600 truncate">{file.name}</div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full mt-6 py-2.5 rounded-lg bg-black text-white text-sm hover:bg-gray-900 transition disabled:opacity-40"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
