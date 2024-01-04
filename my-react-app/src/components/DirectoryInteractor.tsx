import React, { useState } from "react";
import axios from "axios";

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
  type: 'question' | 'answer';
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


const DirectoryInteractor: React.FC<DirectoryInteractorProps> = ({ selectedDirectory }) => {
  const [question, setQuestion] = useState<string>("");
  const [conversation, setConversation] = useState<Message[]>([]);
  const { name, path, toggled, nodeType, url } = selectedDirectory;

  const handleQuestionSubmit = async () => {
    if (question.trim()) {
      const newConversation = [...conversation, { type: 'question', text: question }];
      setConversation(newConversation);
      setQuestion("");
      console.log(selectedDirectory.url)
      try {
        const githubContentResponse = await axios.post('http://127.0.0.1:5000/fetch-github-content', { url: selectedDirectory.url });
        const llmResponse = await axios.post("http://127.0.0.1:5000/ask", {
          question,
          context: JSON.stringify(githubContentResponse.data), // Pass the actual data
        });

        setConversation([...newConversation, { type: 'answer', text: llmResponse.data.answer }]);
      } catch (error) {
        console.error("Error:", error);
        setConversation([...newConversation, { type: 'answer', text: "Error processing your request." }]);
      }
    }
  };

  return (
    <div className="bg-white bg-opacity-70 text-black rounded-lg p-4 shadow-lg overflow-y-auto max-h-[80vh]">

    <div className="shadow rounded-lg p-6 flex flex-col h-full">
      
      <h3 className="text-lg text-black font-semibold mb-4">
        Conversation about the "{selectedDirectory?.name}" {nodeType}:
      </h3>
      <div className="flex-grow text-black  overflow-y-auto mb-4 p-2 space-y-2" id="conversation-container">
        {conversation.map((message, index) => (
          <div key={index} className={`max-w-xs ${message.type === 'question' ? 'self-end' : 'self-start'}`}>
            <div className={`inline-block px-4 py-2 rounded-lg ${message.type === 'question' ? 'bg-blue-100' : 'bg-green-100'}`}>{message.text}</div>
          </div>
        ))}
      </div>
      <textarea
        className="w-full p-3 border text-black border-gray-300 rounded mb-4 overflow-y-auto max-h-[40vh]"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Type your question here..."
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) { // Prevents the Enter key from adding a new line when Shift is not held down.
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
