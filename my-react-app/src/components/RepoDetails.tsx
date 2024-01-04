import React, { useState, useEffect } from "react";
import RepositoryCard from "./RepositoryCard"; // Adjust the path as necessary
import RepositoryTreeView from "./RepositoryTreeView";
import DirectoryInteractor from "./DirectoryInteractor";
// import FileTree from './FileTree'; // Adjust the path as necessary
import { FaGithub } from "react-icons/fa";

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

  const FileViewer = ({ file }) => {
    return (
      <div className="file-viewer">
        <h3 className="text-lg font-semibold mb-2">{file.name}</h3>
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
      className="bg-cover bg-no-repeat bg-center h-screen"
      style={{ backgroundImage: "url(/src/assets/Exploration3.png)" }}
    >
<div className="bg-black bg-opacity-50 min-h-screen flex justify-center items-center border border-gray-200 rounded-lg">

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
        <div className="w-full justify-center items-center mb-10">

        {repositoryContent.length > 0 && (
          <div className="mt-4">
            {/* {repositoryContent.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold text-white">
                  Repository Content:
                </h3>
                <RepositoryTreeView repositoryContent={repositoryContent} />
              </div>
            )} */}
            {repositoryContent.length > 0 && (
              <div className="flex overflow-y-auto max-h-[60vh] mb-4 p-2 space-y-2" id="conversation-container">

                <div className="w-1/2 px-10 bg-black bg-opacity-70 text-white rounded-lg p-4 shadow-lg overflow-y-auto max-h-[80vh]">
                  <h3 className="text-2xl font-semibold mb-4">
                    Repository Content:
                  </h3>
                  <RepositoryTreeView
                    repositoryContent={repositoryContent}
                    onFileSelect={handleDirectoryClick}
                  />
                </div>
                <div className="w-1/2 bg-black bg-opacity-70 text-white rounded-lg p-4 shadow-lg overflow-y-auto max-h-[80vh]">
                  {selectedDirectory && <FileViewer file={selectedDirectory} />}
                  {selectedDirectory && (
                    <DirectoryInteractor
                      selectedDirectory={selectedDirectory}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
      </div>

    </div>
  );
};

export default RepoDetails;
