"use client";
import React, { useState } from "react";
import { Folder, FolderOpen, FileCode, FileText, FileJson, File, ChevronRight, ChevronDown } from "lucide-react";
import { FileNode } from "@/lib/fileSystem";

interface FileTreeProps {
  nodes: FileNode[];
  activeFilePath: string | null;
  onFileSelect: (node: FileNode) => void;
}

export default function FileTree({ nodes, activeFilePath, onFileSelect }: FileTreeProps) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="p-4.5 text-[12px] font-sans text-neutral-500 italic select-none">
        No files loaded. Select a directory to view files.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col font-sans text-[13.5px] select-none py-1">
      {nodes.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          activeFilePath={activeFilePath}
          onFileSelect={onFileSelect}
          depth={0}
        />
      ))}
    </div>
  );
}

interface TreeNodeProps {
  node: FileNode;
  activeFilePath: string | null;
  onFileSelect: (node: FileNode) => void;
  depth: number;
}

function TreeNode({ node, activeFilePath, onFileSelect, depth }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const hasChildren = node.isDir && node.children && node.children.length > 0;
  const isActive = activeFilePath === node.path;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.isDir) {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(node);
    }
  };

  // Select proper icon based on node type & file extension
  const getIcon = () => {
    if (node.isDir) {
      return isExpanded ? (
        <FolderOpen className="h-4 w-4 text-accent shrink-0" />
      ) : (
        <Folder className="h-4 w-4 text-neutral-450 shrink-0" />
      );
    }

    const ext = node.name.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "py":
        return <FileCode className="h-4 w-4 text-yellow-550 dark:text-yellow-500 shrink-0" />;
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
        return <FileCode className="h-4 w-4 text-blue-500 dark:text-blue-400 shrink-0" />;
      case "json":
        return <FileJson className="h-4 w-4 text-purple-500 dark:text-purple-400 shrink-0" />;
      case "md":
        return <FileText className="h-4 w-4 text-green-600 dark:text-green-550 shrink-0" />;
      case "txt":
      case "log":
      case "conf":
      case "ini":
      case "env":
        return <FileText className="h-4 w-4 text-neutral-400 shrink-0" />;
      default:
        return <File className="h-4 w-4 text-neutral-500 shrink-0" />;
    }
  };

  return (
    <div className="w-full flex flex-col px-1.5">
      <div
        onClick={handleSelect}
        className={`group flex items-center gap-1.5 py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-150 relative ${
          isActive
            ? "bg-accent/10 text-accent font-semibold border-l-2 border-accent"
            : "hover:bg-neutral-800/25 text-neutral-300 hover:text-foreground border-l-2 border-transparent"
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {/* Chevron for directories */}
        <div className="w-4 flex items-center justify-center shrink-0">
          {node.isDir && (
            <button
              onClick={handleToggle}
              className="p-0.5 hover:bg-neutral-750/30 rounded text-neutral-500 hover:text-foreground transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Icon & File/Folder Name */}
        <div className="flex items-center gap-2 overflow-hidden truncate">
          {getIcon()}
          <span className="truncate">{node.name}</span>
        </div>
      </div>

      {/* Children list */}
      {node.isDir && isExpanded && hasChildren && (
        <div className="w-full flex flex-col">
          {node.children!.map((childNode) => (
            <TreeNode
              key={childNode.path}
              node={childNode}
              activeFilePath={activeFilePath}
              onFileSelect={onFileSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
