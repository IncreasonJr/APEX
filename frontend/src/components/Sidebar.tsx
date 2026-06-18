"use client";

import React, { useState } from "react";
import { PanelLeftClose, PanelLeftOpen, Plus, Settings, HelpCircle, FolderOpen, Loader2, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import FileTree from "./FileTree";
import { FileNode } from "@/lib/fileSystem";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  activeFilePath: string | null;
  onFileSelect: (node: FileNode) => void;
  fileTreeNodes: FileNode[];
  onLoadProject: (path: string) => Promise<void>;
  projectPath: string | null;
  isLoadingTree: boolean;
}

export default function Sidebar({
  collapsed,
  onToggle,
  onNewChat,
  activeFilePath,
  onFileSelect,
  fileTreeNodes,
  onLoadProject,
  projectPath,
  isLoadingTree,
}: SidebarProps) {
  const [showPathDialog, setShowPathDialog] = useState(false);
  const [inputPath, setInputPath] = useState("/home/caleb/Desktop/AGENT");
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenDialog = () => {
    setShowPathDialog(true);
    setDialogError(null);
  };

  const handleCloseDialog = () => {
    setShowPathDialog(false);
    setDialogError(null);
  };

  const handleLoadPath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPath.trim()) return;

    setIsSubmitting(true);
    setDialogError(null);
    try {
      await onLoadProject(inputPath.trim());
      setShowPathDialog(false);
      if (!collapsed && window.innerWidth < 768) {
        onToggle();
      }
    } catch (err: any) {
      console.error(err);
      setDialogError(err.message || "Failed to load directory. Make sure the path is correct and accessible.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileClick = (node: FileNode) => {
    onFileSelect(node);
    if (!collapsed && window.innerWidth < 768) {
      onToggle();
    }
  };

  const handleNewChatClick = () => {
    onNewChat();
    if (!collapsed && window.innerWidth < 768) {
      onToggle();
    }
  };

  const getProjectFolderName = () => {
    if (!projectPath) return null;
    return projectPath.split("/").pop() || projectPath;
  };

  return (
    <>
      {/* Mobile Sidebar Backdrop Overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed md:relative top-0 bottom-0 left-0 h-screen flex flex-col justify-between border-r border-border-color bg-[var(--sidebar-bg)]/95 md:bg-[var(--sidebar-bg)]/85 glass-panel transition-all duration-300 z-40 select-none ${
          collapsed 
            ? "-translate-x-full md:translate-x-0 md:w-[68px]" 
            : "translate-x-0 w-[260px]"
        }`}
      >
        {/* Top Section */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className={`p-4 flex items-center border-b border-border-color shrink-0 ${collapsed ? "justify-center px-2" : "justify-between"}`}>
            <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between w-full"} overflow-hidden`}>
              {!collapsed && (
                <div className="flex items-center gap-2.5">
                  <img src="/logo.png" className="h-7 w-7 object-contain select-none pointer-events-none" alt="Apex Logo" />
                  <span className="font-sans font-extrabold text-[15px] tracking-wider text-foreground select-none uppercase">
                    APEX
                  </span>
                </div>
              )}
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg hover:bg-neutral-800/40 border border-transparent hover:border-border-color transition-all text-neutral-400 hover:text-accent shrink-0 flex items-center justify-center"
                aria-label="Toggle sidebar"
                title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {collapsed ? (
                  <PanelLeftOpen className="h-4.5 w-4.5 text-accent" />
                ) : (
                  <PanelLeftClose className="h-4.5 w-4.5" />
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-3 flex flex-col gap-2 shrink-0 border-b border-border-color">
            <button
              onClick={handleOpenDialog}
              className={`flex items-center gap-2.5 px-3.5 h-10 rounded-xl border border-border-color bg-neutral-900/30 hover:bg-neutral-900/60 text-[12px] font-sans font-medium text-neutral-350 hover:text-foreground hover:border-accent transition-all duration-200 shrink-0 ${
                collapsed ? "w-10 p-0 justify-center" : "w-full"
              }`}
              title="Open Local Project Folder"
            >
              <FolderOpen className="h-4 w-4 text-accent shrink-0" />
              {!collapsed && <span className="uppercase tracking-wider font-semibold">New Project</span>}
            </button>

            <button
              onClick={handleNewChatClick}
              className={`flex items-center gap-2.5 px-3.5 h-10 rounded-xl border border-border-color bg-surface/30 hover:bg-surface text-[12px] font-sans font-medium text-neutral-350 hover:text-foreground hover:border-accent transition-all duration-200 shrink-0 ${
                collapsed ? "w-10 p-0 justify-center" : "w-full"
              }`}
              title="Reset Chat Session"
            >
              <Plus className="h-4 w-4 text-accent shrink-0" />
              {!collapsed && <span className="uppercase tracking-wider font-semibold">New Session</span>}
            </button>
          </div>

          {/* File Explorer Tree */}
          <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
            {!collapsed && (
              <>
                <div className="px-4.5 pt-4 pb-1.5 flex items-center justify-between shrink-0 font-sans text-[11px] font-semibold text-neutral-450 dark:text-neutral-400 uppercase tracking-wider">
                  <span>Workspace File Explorer</span>
                  {isLoadingTree && <Loader2 className="h-3 w-3 animate-spin text-accent" />}
                </div>

                {projectPath && !isLoadingTree && (
                  <div className="px-4.5 py-2 border-b border-border-color/40 text-xs font-sans text-neutral-350 select-all truncate shrink-0">
                    📂 {getProjectFolderName()} <span className="text-[11px] text-neutral-500 font-light">({projectPath})</span>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto mt-1">
                  <FileTree
                    nodes={fileTreeNodes}
                    activeFilePath={activeFilePath}
                    onFileSelect={handleFileClick}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-3 flex flex-col gap-1 border-t border-border-color bg-surface/10 shrink-0">
          <ThemeToggle />

          {!collapsed ? (
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex items-center gap-2 px-2 py-1.5 text-[10px] font-sans font-bold text-neutral-500 select-none uppercase tracking-wider">
                <span>SYSTEM PARAMETERS</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 text-xs font-sans text-neutral-350">
                <span>API Status</span>
                <span className="flex items-center gap-1.5 text-green-550 dark:text-green-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-550 dark:bg-green-400 animate-pulse"></span>
                  ONLINE
                </span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 text-xs font-sans text-neutral-450">
                <span>Memory Cache</span>
                <span className="text-accent uppercase font-bold text-[10px] tracking-wide">Hindsight</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 pt-1">
              <span className="h-2 w-2 rounded-full bg-green-550 dark:bg-green-400 animate-pulse" title="System status: ONLINE"></span>
            </div>
          )}
        </div>
      </aside>

      {/* Path Input Dialog Modal */}
      {showPathDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-border-color rounded-lg overflow-hidden shadow-2xl font-sans text-xs text-foreground animate-fade-in">
            {/* Dialog Header */}
            <div className="flex items-center justify-between px-4.5 py-3.5 border-b border-border-color bg-neutral-950">
              <span className="font-bold text-xs tracking-wider uppercase text-neutral-300 flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-accent" />
                Select Project Workspace
              </span>
              <button
                onClick={handleCloseDialog}
                className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-foreground rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Dialog Form */}
            <form onSubmit={handleLoadPath} className="p-4.5 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
                  Absolute Path on Host System:
                </label>
                <input
                  type="text"
                  value={inputPath}
                  onChange={(e) => setInputPath(e.target.value)}
                  placeholder="/absolute/path/to/project"
                  className="w-full bg-neutral-950 border border-border-color focus:border-accent rounded-md px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-0 leading-normal"
                  autoFocus
                />
                <span className="text-[11px] text-neutral-500 italic mt-0.5">
                  Apex accesses directories directly from your filesystem.
                </span>
              </div>

              {dialogError && (
                <div className="p-2.5 border border-red-900/30 bg-red-950/20 text-red-400 rounded text-xs leading-relaxed">
                  {dialogError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 mt-2.5 pt-2.5 border-t border-border-color">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="px-3.5 h-9.5 rounded-md border border-border-color hover:bg-neutral-800 text-xs uppercase font-bold text-neutral-400 hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4.5 h-9.5 rounded-md bg-accent text-white hover:bg-accent/90 text-xs uppercase font-bold transition-colors flex items-center gap-2 shadow-md shadow-accent/10"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Initialize Project"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
