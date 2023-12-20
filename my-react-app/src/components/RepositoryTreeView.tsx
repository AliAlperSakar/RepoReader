import React, { useState } from "react";
import { Treebeard } from "react-treebeard";

const RepositoryTreeView = ({ repositoryContent, onFileSelect }) => {
  const transformedData = transformToTreeData(repositoryContent);
  const [data, setData] = useState(transformedData);
  console.log(transformedData);

  const onToggle = (node, toggled) => {
    if (node.children) {
      node.toggled = toggled;
    }
    setData(Object.assign({}, data));

    // Call the onFileSelect method when a directory is clicked
    if (node.nodeType === "dir") {
      onFileSelect(node);
    }
  };

  const onNodeSelect = (node) => {
    console.log(`Node selected: ${node.name}`); // Log to see if this function gets called
    console.log(node.nodeType)
    if (node.nodeType === "file") {
      onFileSelect(node);
    } else {
      console.log(`Toggling directory: ${node.name}`); // Log to see if directories are recognized
      onToggle(node, !node.toggled);
    }
  };

  return <Treebeard data={data} onToggle={onNodeSelect} />;
};

// Function to transform the repository content to the expected format
const transformToTreeData = (repositoryContent) => {
  // Helper function to recursively build the tree
  const buildTree = (nodes, parentPath = "") => {
    return nodes
      .filter((node) => {
        // Get the directory path of the current node
        const dirPath = node.path.substring(0, node.path.lastIndexOf("/"));
        // console.log("HOLAA")
        console.log(dirPath);

        // Include nodes that are in the current parent path
        return parentPath === dirPath;
      })
      .map((node) => {
        // Check if the current node is a directory
        const isDirectory = node.type === "dir";
        // console.log(isDirectory + node.name, node.type)
        // Create the tree node
        const treeNode = {
          name: node.name,
          path: node.path,
          toggled: parentPath === "", // Only toggle root directories by default
          nodeType: node.type,
          url: node.html_url,
          children: isDirectory ? buildTree(repositoryContent, node.path) : [],
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
