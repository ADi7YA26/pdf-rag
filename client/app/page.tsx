import Chat from "./components/chat";
import FileUploadComponent from "./components/file-upload";
import { DocumentProvider } from "@/lib/document-context";

export default function Home() {
  return (
    // DocumentProvider shares the uploaded fileId between the two panels
    <DocumentProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
        {/* Left — upload panel */}
        <div className="md:w-1/2 p-6">
          <FileUploadComponent />
        </div>

        {/* Right — chat panel */}
        <div className="md:w-1/2 flex-1">
          <Chat />
        </div>
      </div>
    </DocumentProvider>
  );
}
