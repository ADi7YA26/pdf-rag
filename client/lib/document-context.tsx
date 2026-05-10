"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { UploadedFile } from "./types";

interface DocumentContextValue {
  uploadedFile: UploadedFile | null;
  setUploadedFile: (file: UploadedFile | null) => void;
}

const DocumentContext = createContext<DocumentContextValue | null>(null);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  return (
    <DocumentContext.Provider value={{ uploadedFile, setUploadedFile }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument(): DocumentContextValue {
  const ctx = useContext(DocumentContext);
  if (!ctx) {
    throw new Error("useDocument must be used inside <DocumentProvider>");
  }
  return ctx;
}
