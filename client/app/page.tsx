import Chat from "./components/chat";
import FileUploadComponent from "./components/file-upload";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Left */}
      <div className="md:w-1/2 p-6">
        <FileUploadComponent />
      </div>

      {/* Right */}
      <div className="md:w-1/2 h-screen">
        <Chat />
      </div>
    </div>
  );
}
