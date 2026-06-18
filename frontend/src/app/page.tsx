"use client";

import { useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";
import { FileNode, fetchFileTree, fetchFileContent } from "@/lib/fileSystem";

export default function Page() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const newChatTriggerRef = useRef<(() => void) | null>(null);

  // Workspace File System States
  const [projectPath, setProjectPath] = useState<string | null>(null);
  const [fileTreeNodes, setFileTreeNodes] = useState<FileNode[]>([]);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [activeFileContent, setActiveFileContent] = useState<string | null>(null);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNewChat = () => {
    if (newChatTriggerRef.current) {
      newChatTriggerRef.current();
    }
  };

  const handleLoadProject = async (path: string) => {
    setIsLoadingTree(true);
    try {
      const tree = await fetchFileTree(path);
      setFileTreeNodes(tree);
      setProjectPath(path);
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsLoadingTree(false);
    }
  };

  const handleFileSelect = async (node: FileNode) => {
    if (node.isDir) return;
    try {
      const response = await fetchFileContent(node.path);
      setActiveFilePath(response.path);
      setActiveFileContent(response.content);
    } catch (err) {
      console.error("Failed to load file content:", err);
      alert(`Error reading file: ${node.name}`);
    }
  };

  const handleClearActiveFile = () => {
    setActiveFilePath(null);
    setActiveFileContent(null);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--background)]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        onNewChat={handleNewChat}
        activeFilePath={activeFilePath}
        onFileSelect={handleFileSelect}
        fileTreeNodes={fileTreeNodes}
        onLoadProject={handleLoadProject}
        projectPath={projectPath}
        isLoadingTree={isLoadingTree}
      />
      <ChatInterface
        onNewChatRef={newChatTriggerRef}
        activeFilePath={activeFilePath}
        activeFileContent={activeFileContent}
        onClearActiveFile={handleClearActiveFile}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
      />
    </div>
  );
}
