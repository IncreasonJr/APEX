"use client";
import React from "react";
import { FileCode, X } from "lucide-react";

interface ContextIndicatorProps {
  activeFilePath: string | null;
  onClear: () => void;
}

export default function ContextIndicator({ activeFilePath, onClear }: ContextIndicatorProps) {
  if (!activeFilePath) return null;

  // Extract filename for display
  const fileName = activeFilePath.split("/").pop();

  return (
    <div className="flex items-center justify-between px-3 py-1.5 border border-border-color bg-surface/40 rounded-md font-mono text-[11px] text-foreground mb-3 animate-fade-in shrink-0">
      <div className="flex items-center gap-2 overflow-hidden">
        <FileCode className="h-3.5 w-3.5 text-accent shrink-0" />
        <span className="text-neutral-400 font-semibold uppercase tracking-wider text-[9px] shrink-0">
          Active Context:
        </span>
        <span className="truncate text-foreground font-medium" title={activeFilePath}>
          {fileName} <span className="text-neutral-500 font-light">({activeFilePath})</span>
        </span>
      </div>
      <button
        onClick={onClear}
        className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-accent rounded transition-colors"
        title="Clear file context"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
