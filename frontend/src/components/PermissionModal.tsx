"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Edit2, Eye } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  path: string;
  content: string;
  onApprove: (path: string, content: string) => Promise<void>;
}

export default function PermissionModal({
  isOpen,
  onClose,
  path,
  content,
  onApprove,
}: PermissionModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditedContent(content);
    setIsEditing(false);
    setError(null);
  }, [content, path, isOpen]);

  if (!isOpen) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onApprove(path, editedContent);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to write file");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileExt = path.split(".").pop() || "txt";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[var(--surface)] border border-border-color rounded-2xl overflow-hidden shadow-2xl font-sans text-foreground flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-color bg-neutral-900/40">
          <div className="flex flex-col gap-0.5 min-w-0 flex-1 pr-4">
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
              File Creation Request
            </span>
            <span className="text-sm font-semibold truncate text-neutral-200" title={path}>
              {path}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-foreground rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col min-h-0 bg-neutral-950/20">
          {error && (
            <div className="mb-4 p-3 border border-red-900/30 bg-red-955/20 text-red-400 rounded-xl text-xs leading-relaxed">
              {error}
            </div>
          )}

          <div className="flex-1 flex flex-col min-h-0 border border-border-color rounded-xl overflow-hidden bg-neutral-950">
            {/* Toolbar */}
            <div className="flex justify-between items-center px-4 py-2 bg-neutral-900 border-b border-border-color text-neutral-450 font-mono text-[10px] select-none shrink-0">
              <span>{fileExt.toUpperCase()}</span>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors py-1 px-2.5 rounded border border-border-color hover:bg-background"
              >
                {isEditing ? (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Preview</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {isEditing ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-full p-4 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none font-mono text-xs text-neutral-200 leading-relaxed min-h-[300px]"
                />
              ) : (
                <SyntaxHighlighter
                  language={fileExt.toLowerCase()}
                  style={tomorrow}
                  customStyle={{
                    margin: 0,
                    padding: "1rem",
                    background: "transparent",
                    fontSize: "12px",
                    lineHeight: "1.6",
                  }}
                  PreTag="div"
                >
                  {editedContent || "[Empty File]"}
                </SyntaxHighlighter>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-border-color bg-neutral-900/40 shrink-0">
          <span className="text-[10px] font-mono text-neutral-500">
            {editedContent.length} characters
          </span>
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="px-4.5 py-2 rounded-xl border border-border-color hover:bg-neutral-800 text-xs uppercase font-bold text-neutral-400 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-accent hover:bg-accent/90 text-white text-xs uppercase font-bold transition-colors flex items-center gap-2 shadow-lg shadow-accent/10"
            >
              <Check className="h-4 w-4" />
              {isSubmitting ? "Writing..." : "Approve & Write"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
