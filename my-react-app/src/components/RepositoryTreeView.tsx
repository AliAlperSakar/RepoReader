import React, { useState } from "react";
import { Treebeard } from "react-treebeard";
import { SiPython } from 'react-icons/si'; // Importing icons
import { FiFolder, FiFileText } from 'react-icons/fi'; // Importing Feather icons
import axios from 'axios';

const RepositoryTreeView = ({ repositoryContent, onFileSelect }) => {
  const transformedData = transformToTreeData(repositoryContent);
  const [data, setData] = useState(transformedData);  
  
  const convertGithubUrlToApiUrl = (githubUrl) => {
    // Construct the new API URL based on the GitHub URL
    // You need to adjust the URL format according to the actual GitHub URL you receive
    // This is just an example and may not match your actual URL format
    const urlParts = githubUrl.replace("https://github.com/", "").split("/");
    const owner = urlParts[0];
    const repo = urlParts[1];
    const path = urlParts.slice(4).join('/');
    console.log(path)
    return `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  };
  
  const updateTreeWithDirectoryContents = (nodeToUpdate, directoryContents) => {
    // Helper function to transform directory contents into tree nodes
    const createTreeNodesFromContents = (contents) => {
      return contents.map(item => ({
        name: item.name,
        path: item.path,
        size: item.size,
        toggled: false,
        nodeType: item.type,
        url: item.download_url, // Ensure this is the correct property for the URL
        children: item.type === 'dir' ? [] : null
      }));
    };
  
    // Helper function to recursively find and update a node within the tree
    const updateNodeChildren = (nodes, path, newChildren) => {
      return nodes.map(node => {
        if (node.path === path) {
          return {
            ...node,
            children: newChildren,
            toggled: true // Automatically expand the node
          };
        } else if (node.children) {
          return {
            ...node,
            children: updateNodeChildren(node.children, path, newChildren)
          };
        }
        return node; // Return the node if it's not the one we're updating
      });
    };
  
    // Transform the directory contents into tree nodes
    const newChildren = createTreeNodesFromContents(directoryContents);
  
    // Use the helper function to update the tree
    const newData = updateNodeChildren(data.children, nodeToUpdate.path, newChildren);
  
    // Set the new state with a new object for the root to ensure re-render
    setData(prevData => ({ ...prevData, children: newData }));
  };
  
  const fetchDirectoryContents = async (node) => {
    const apiUrl = convertGithubUrlToApiUrl(node.url);
    if (!apiUrl) {
      console.error('Could not convert GitHub URL to API URL:', node.url);
      return;
    }
    
    // Optimistically update the UI to show the directory as expanded
    // This does not show the contents yet, but it "opens" the folder
    setData(prevData => {
      return {
        ...prevData,
        children: updateNodeChildren(prevData.children, node.path, [], true) // true to toggle expanded state
      };
    });
  
    console.log('Fetching from API URL:', apiUrl);
    try {
      const response = await axios.get(apiUrl);
      const directoryContents = response.data;
      console.log('Directory contents:', directoryContents);
      // Update the `data` state to include these contents
      updateTreeWithDirectoryContents(node, directoryContents);
    } catch (error) {
      console.error("Error fetching directory contents:", error);
      // If the fetch fails, update the state to "close" the folder again
      setData(prevData => {
        return {
          ...prevData,
          children: updateNodeChildren(prevData.children, node.path, [], false) // false to toggle expanded state
        };
      });
    }
  };
    
  const updateNodeChildren = (nodes, path, newChildren, isToggled) => {
    return nodes.map(node => {
      if (node.path === path) {
        return {
          ...node,
          children: newChildren,
          toggled: isToggled // Use the new parameter to set the toggled state
        };
      } else if (node.children) {
        return {
          ...node,
          children: updateNodeChildren(node.children, path, newChildren, node.toggled) // keep the existing toggled state for other nodes
        };
      } else {
        return node;
      }
    });
  };
  

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
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
      if (node.nodeType === 'dir') {
        setIsExpanded(!isExpanded); // Toggle the expanded state
        if (!isExpanded && !node.children.length) {
          // If the directory is being expanded and has no children loaded yet, fetch contents
          fetchDirectoryContents(node);
        }
      } else {
        onFileSelect(node); // Handle file selection
      }
    };

    return (
    <div>
      <div className="flex items-center p-2 cursor-pointer" onClick={toggleExpand}>
        {getFileIcon(node)}
        <span className="flex w-1/2 text-white">{node.name}</span>
        <span className="flex text-white ml-auto">{node.size}  bytes </span>
      </div>
      {isExpanded && node.children && (
        <div className="ml-4">
          {node.children.map(childNode => (
            <TreeNode key={childNode.name} node={childNode} />
          ))}
        </div>
      )}
    </div>
  );
};
  
  const onNodeSelect = (node) => {
    console.log('Node selected:', node);
    if (node.nodeType === "dir") {
      // If it's a directory and doesn't already have children loaded, fetch them
      console.log(node.path)
      console.log('Fetching contents for directory:', node.url);
      fetchDirectoryContents(node);
    } else {
      // Otherwise, it's a file or an already expanded directory, so handle it as before
      onFileSelect(node);
    } 
  };
  
  return (
    <div>
      {data.children.map(node => (
        <TreeNode key={node.name} node={node} />
      ))}
    </div>
  );
};

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
        console.log(node.size)
        // Check if the current node is a directory
        // const isDirectory = node.type === "dir";
        // console.log(isDirectory + node.name, node.type)
        // Create the tree node
        const treeNode = {
          name: node.name,
          path: node.path,
          size: node.size,
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