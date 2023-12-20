import React, { useState, useEffect } from "react";

const DirectoryInteractor = ({ selectedDirectory }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    console.log("WAGHTATA")
    console.log(selectedDirectory);

    const handleQuestionSubmit = async () => {
      // Code to submit question to LLM and get the response
      // This is a placeholder for the actual LLM API call
      const response = await getAnswerFromLLM(question, selectedDirectory);
      setAnswer(response);
    };
  
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Ask a question about the "{selectedDirectory?.name}" directory:</h3>
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
        {answer && <div className="mt-4 p-4 bg-gray-100 rounded">{answer}</div>}
      </div>
    );
  };
  
  export default DirectoryInteractor;
