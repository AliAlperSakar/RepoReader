import React, { useState, useEffect } from "react";
import RepositoryCard from "./RepositoryCard"; // Adjust the path as necessary
import RepositoryTreeView from "./RepositoryTreeView";
import DirectoryInteractor from "./DirectoryInteractor";
// import FileTree from './FileTree'; // Adjust the path as necessary

import { FaGithub } from "react-icons/fa";
import { background } from "../assets";



interface RepositoryInfo {
  name: string;
  description: string;
  owner: {
    login: string;
  };
}

interface RepositoryContent {
  name: string;
  type: "file" | "dir"; // 'file' for files, 'dir' for folders
}

const RepoDetails: React.FC = () => {
  const [repositoryUrl, setRepositoryUrl] = useState<string>("");
  const [repositoryInfo, setRepositoryInfo] = useState<RepositoryInfo | null>(
    null
  );
  const [repositoryError, setRepositoryError] = useState<string | null>(null);
  const [repositoryContent, setRepositoryContent] = useState<
    RepositoryContent[]
  >([]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDirectory, setSelectedDirectory] = useState(null);

  const [error, setError] = useState<string | null>(null);

  const handleDirectoryClick = (node) => {
    setSelectedDirectory(node);
  };



  const fetchRepositoryDetails = async () => {
    // Use the URL object to parse the full URL
    const repoUrlObj = new URL(repositoryUrl);
    // Extract the pathname and remove the leading slash
    const repoPath = repoUrlObj.pathname.substring(1);
    try {
      const response = await fetch(`https://api.github.com/repos/${repoPath}`);
      if (response.ok) {
        const data = await response.json();
        setRepositoryInfo(data);
        setError(null);
      } else {
        setRepositoryInfo(null);
        setError("Repository not found");
      }
    } catch (error) {
      console.error("Error fetching repository info:", error);
      setRepositoryInfo(null);
      setError("An error occurred while fetching repository info");
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${repoPath}/contents`
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        const contents = data.filter(
          (item: any) => item.type === "file" || item.type === "dir"
        );
        setRepositoryContent(contents);
      } else {
        setRepositoryContent([]);
      }
    } catch (error) {
      console.error("Error fetching repository content:", error);
      setRepositoryContent([]);
    }
  };

  useEffect(() => {
    if (selectedDirectory) {
      // Fetch additional data for the selected directory or perform other actions
    }
  }, [selectedDirectory]); // Dependency array ensures this runs when selectedDirectory changes

  return (
    <div
      className="bg-cover bg-no-repeat bg-center"
      style={{ backgroundImage: `url(${background})` }}
    >
<div className="bg-black bg-opacity-50 min-h-screen justify-center items-center border border-gray-200 rounded-lg">

      <div className="inline">
        <div className="flex w-full justify-center mb-10">
          <div className="inline-flex pt-10">
            <h2 className="text-white">
              <FaGithub size={150} />
            </h2>
            <h2 className="flex justify-center items-center text-4xl font-bold tracking-tight text-white sm:text-6xl">
              GitHub Repository Details
            </h2>
          </div>
        </div>
        <div className="inline-flex w-full justify-center items-center  mb-10">
        <input
              type="text"
              placeholder="Enter GitHub repository URL"
              className="w-6/12	p-2 border rounded-md"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
            />
            <button
          className="bg-blue-500 text-white px-10 py-2 rounded hover:bg-blue-600 h-10	"
          onClick={fetchRepositoryDetails}
        >
          Get Repository Details
        </button>
        </div>


        {repositoryError && (
          <p className="text-red-500 mt-2">{repositoryError}</p>
        )}
      {repositoryInfo && <RepositoryCard repo={repositoryInfo} />}
      
      </div>
      <div className="flex justify-center items-center">
        {repositoryContent.length > 0 && (
          <div className="w-3/4">
            <div className="mt-4">
              <div className="flex overflow-y-auto p-2 " id="conversation-container">
                <div className="w-full px-10 bg-black bg-opacity-70 text-white rounded-lg p-4 shadow-lg overflow-y-auto max-h-[58vh]">
                  <div className="flex border-y-1 bg-gray-700 rounded-lg">

                  <h3 className="text-xl w-1/2 text-yellow-600 font-semibold mb-4">
                    Repository Content <br></br> <h1 className="text-sm text-red-500">(Select File/Folder)</h1>
                  </h3>
                  <h2 className="text-xl ml-auto text-yellow-600 font-semibold mb-4">
                    Size
                  </h2>
                  </div>
                  <RepositoryTreeView
                    repositoryContent={repositoryContent}
                    onFileSelect={handleDirectoryClick}
                  />
                </div>
                {selectedDirectory && (
                  <div className="w-full bg-black bg-opacity-70 text-white rounded-lg p-4 shadow-lg overflow-y-auto max-h-[58vh]">
                {selectedDirectory && (
                    <DirectoryInteractor
                      selectedDirectory={selectedDirectory}
                    />
                  )}
                  </div>
                  
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      

      </div>
      
    </div>
  );
};

export default RepoDetails;
