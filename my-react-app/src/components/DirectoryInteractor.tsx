import React, { useState } from "react";
import axios from "axios";

interface Directory {
  name: string;
  url: string;
}

interface Message {
  type: 'question' | 'answer';
  text: string;
}

interface DirectoryInteractorProps {
  selectedDirectory: Directory;
}

const DirectoryInteractor: React.FC<DirectoryInteractorProps> = ({ selectedDirectory }) => {
  const [question, setQuestion] = useState<string>("");
  const [conversation, setConversation] = useState<Message[]>([]);

  const handleQuestionSubmit = async () => {
    if (question.trim()) {
      const newConversation = [...conversation, { type: 'question', text: question }];
      setConversation(newConversation);
      setQuestion("");

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
    <div className="bg-white shadow rounded-lg p-6 flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-4">
        Conversation about the "{selectedDirectory?.name}" directory:
      </h3>
      <div className="flex-grow overflow-y-auto mb-4 p-2 space-y-2" id="conversation-container">
        {conversation.map((message, index) => (
          <div key={index} className={`max-w-xs ${message.type === 'question' ? 'self-end' : 'self-start'}`}>
            <div className={`inline-block px-4 py-2 rounded-lg ${message.type === 'question' ? 'bg-blue-100' : 'bg-green-100'}`}>{message.text}</div>
          </div>
        ))}
      </div>
      <textarea
        className="w-full p-3 border border-gray-300 rounded mb-4"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Type your question here..."
      />
      <button
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
        onClick={handleQuestionSubmit}
      >
        Ask
      </button>
    </div>
  );
};

export default DirectoryInteractor;
