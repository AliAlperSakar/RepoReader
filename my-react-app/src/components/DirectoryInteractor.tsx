import React, { useState } from "react";
import axios from "axios";
import { loadEnv } from "vite";

const apiUrl = import.meta.env.VITE_APP_API_URL;
console.log(apiUrl);

interface Directory {
  name: string;
  url: string;
}

interface Node {
  name: string;
  path: string;
  toggled: boolean;
  nodeType: string;
  url: string;
  children: any[];
}

interface Message {
  type: "question" | "answer";
  text: string;
}


interface DirectoryInteractorProps {
  selectedDirectory: {
    name: string;
    path: string;
    toggled: boolean;
    nodeType: string;
    url: string;
    children: any[];
  };
}

const DirectoryInteractor: React.FC<DirectoryInteractorProps> = ({
  selectedDirectory,
}) => {
  const [question, setQuestion] = useState<string>("");
  const [conversation, setConversation] = useState<Message[]>([]);
  // Define a loading state

  const [isLoading, setIsLoading] = useState(false); // Define the loading state
  const { name, path, toggled, nodeType, url } = selectedDirectory;
  const FileViewer = ({ file }) => {
    return (
      <div className="file-viewer">
        {/* <h3 className="text-lg font-semibold mb-2">{file.name}</h3> */}
        {file.nodeType === "file" && (
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
          >
            Go to that page "{file.name}"
          </a>
        )}
      </div>
    );
  };

  const handleQuestionSubmit = async () => {
    if (question.trim()) {
      const newConversation = [
        ...conversation,
        { type: "question", text: question },
      ];
      setConversation(newConversation);
      setQuestion("");
      setIsLoading(true); // Set loading to true before making the API request
      console.log(selectedDirectory.url);
      try {
        const githubContentResponse = await axios.post(
          `${apiUrl}/fetch-github-content`,
          { url: selectedDirectory.url }
        );
        console.log(githubContentResponse)

        const llmResponse = await axios.post(`${apiUrl}/ask`, {
          question,
          context: JSON.stringify(githubContentResponse.data), // Pass the actual data
        });
        // Set loading to false when the response is received
        setIsLoading(false);

        setConversation([
          ...newConversation,
          { type: "answer", text: llmResponse.data.answer },
        ]);
      } catch (error) {
        console.error("Error:", error);
        setConversation([
          ...newConversation,
          { type: "answer", text: "Error processing your request." },
        ]);
      }
    }
  };

  return (
    <div className="mt-10 bg-slate-500 border-2 h-full bg-opacity-70 text-black rounded-lg p-4 shadow-lg overflow-y-hidden max-h-[50vh]">
      <div className="shadow rounded-lg p-6 flex flex-col h-full">
        <h3 className="text-lg text-white font-semibold mb-4">
          Conversation about the "{selectedDirectory?.name}" {nodeType}:
        </h3>
        <FileViewer file={selectedDirectory} />

        <div
          className="flex-grow text-black  overflow-y-auto mb-4 p-2 space-y-2"
          id="conversation-container"
        >
          
          {conversation.map((message, index) => (
            <div
              key={index}
              className={`max-w-xs ${
                message.type === "question" ? "self-end" : "self-start"
              }`}
            >
              <div
                className={`inline-block px-4 py-2 rounded-lg ${
                  message.type === "question" ? "bg-blue-100" : "bg-green-100"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex flex-col items-center justify-center mt-4">
              <div role="status" className="mt-4 mb-4">
                <svg
                  aria-hidden="true"
                  class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="text-white pl-3">Loading...</span>
              </div>
            </div>
          )}
        </div>
        <textarea
          className="w-full p-3 border text-black border-gray-300 rounded mb-4 overflow-y-auto"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question here..."
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              // Prevents the Enter key from adding a new line when Shift is not held down.
              e.preventDefault(); // Prevents the default action of the Enter key (which might add a new line).
              handleQuestionSubmit(); // Calls the function to submit the question.
            }
          }}
        />
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
          onClick={handleQuestionSubmit}
        >
          Ask
        </button>
      </div>
    </div>
  );
};

export default DirectoryInteractor;
