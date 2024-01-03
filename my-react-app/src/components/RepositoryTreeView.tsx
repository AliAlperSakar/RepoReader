import React, { useState } from "react";
import { Treebeard } from "react-treebeard";
import { SiPython } from 'react-icons/si'; // Importing icons
import { FiFolder, FiFileText } from 'react-icons/fi'; // Importing Feather icons

const RepositoryTreeView = ({ repositoryContent, onFileSelect }) => {
  const transformedData = transformToTreeData(repositoryContent);
  const [data, setData] = useState(transformedData);  
  
  const getFileIcon = (node) => {
    if (node.nodeType === 'dir') {
      return <FiFolder className="inline-block mr-2 text-yellow-500" />;
    } else {
      if (node.name.endsWith('.py')) {
        return <SiPython className="inline-block mr-2 text-blue-500" />;
      } else {
        return <FiFileText className="inline-block mr-2 text-blue-500" />;
      }
    }
  };
  

  const TreeNode = ({ node }) => {
    return (
      <div className="flex items-center p-2 cursor-pointer" onClick={() => onNodeSelect(node)}>
        {getFileIcon(node)}
        <span className="flex-grow text-white ">
          {node.name}
        </span>
      </div>
    );
  };
  
  const onNodeSelect = (node) => {
      onFileSelect(node);
  };

  return (
    <div>
      {data.children.map(node => (
        <TreeNode key={node.name} node={node} />
      ))}
    </div>
  );};

// Function to transform the repository content to the expected format
const transformToTreeData = (repositoryContent) => {
  // Helper function to recursively build the tree
  const buildTree = (nodes, parentPath = "") => {
    return nodes
      .filter((node) => {
        // Get the directory path of the current node
        const dirPath = node.path.substring(0, node.path.lastIndexOf("/"));

        // Include nodes that are in the current parent path
        return parentPath === dirPath;
      })
      .map((node) => {
        // Check if the current node is a directory
        // const isDirectory = node.type === "dir";
        // console.log(isDirectory + node.name, node.type)
        // Create the tree node
        const treeNode = {
          name: node.name,
          path: node.path,
          toggled: parentPath === "", // Only toggle root directories by default
          nodeType: node.type,
          url: node.html_url,
          children: buildTree(repositoryContent, node.path),
        };
        return treeNode;
      });
  };

  // Start building the tree from the root
  const treeData = {
    name: "root",
    children: buildTree(repositoryContent),
    toggled: true,
    path: "",
  };

  return treeData;
};

export default RepositoryTreeView;