import React, { useState, useEffect } from "react";
import RepositoryCard from "./RepositoryCard"; // Adjust the path as necessary
import RepositoryTreeView from "./RepositoryTreeView";
import DirectoryInteractor from "./DirectoryInteractor";
// import FileTree from './FileTree'; // Adjust the path as necessary

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
    if (node.nodeType === "dir") {
      setSelectedDirectory(node);
      console.log("DIRRRR");
      console.log(node);
    }else{
      setSelectedFile(node);
      console.log("FILEEE");
      console.log(node);
    }
  };
  
  const FileViewer = ({ file }) => {
    console.log("FILE");
    console.log(file);
    
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
      Download {file.name}
    </a>
  )}
</div>

    );
  };

  const fetchRepositoryDetails = async () => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repositoryUrl}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
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
        `https://api.github.com/repos/${repositoryUrl}/contents`
      );
      if (response.ok) {
        const data = await response.json();
        const contents = data.filter(
          (item: any) => item.type === "file" || item.type === "dir"
        );
        console.log(contents);
        setRepositoryContent(contents);
      } else {
        setRepositoryContent([]);
      }
    } catch (error) {
      console.error("Error fetching repository content:", error);
      setRepositoryContent([]);
    }
  };

  const onNodeSelect = (node) => {
    if (node.nodeType === "file") {
      setSelectedFile(node);
    } else if (node.nodeType === "dir") {
      setSelectedDirectory(node);
    }
  };

  // useEffect(() => {
  //   const fetchRepositoryInfo = async () => {

  //   };

  //   const fetchRepositoryContent = async () => {

  //   };

  //   fetchRepositoryInfo();
  //   fetchRepositoryContent();
  // }, [repositoryUrl]);

  useEffect(() => {
    if (selectedDirectory) {
      // Fetch additional data for the selected directory or perform other actions
    }
  }, [selectedDirectory]); // Dependency array ensures this runs when selectedDirectory changes

  return (
    <div
      className="bg-cover bg-no-repeat bg-fixed bg-center h-screen"
      style={{ backgroundImage: "url(/src/assets/Exploration3.png)" }}
    >
      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-4 text-white">
          GitHub Repository Details
        </h2>
        <input
          type="text"
          placeholder="Enter GitHub repository URL"
          className="w-full p-2 border rounded-md mb-4"
          value={repositoryUrl}
          onChange={(e) => setRepositoryUrl(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={fetchRepositoryDetails}
        >
          Get Repository Details
        </button>
        {repositoryError && (
          <p className="text-red-500 mt-2">{repositoryError}</p>
        )}

        {repositoryInfo && <RepositoryCard repo={repositoryInfo} />}

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
              <div className="mt-4 flex">
                <div className="w-1/2">
                  <h3 className="text-xl font-semibold text-white">
                    Repository Content:
                  </h3>
                  <RepositoryTreeView
                    repositoryContent={repositoryContent}
                    onFileSelect={handleDirectoryClick}
                  />
                </div>
                
                <div className="w-1/2">
                  {selectedFile && <FileViewer file={selectedFile} />}
                  {(selectedDirectory || selectedFile) && (
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
  );
};

export default RepoDetails;
