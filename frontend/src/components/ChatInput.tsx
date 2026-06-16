"use client";
import React, { useRef, useEffect } from "react";
import { ArrowUp, CornerDownLeft } from "lucide-react";
import ModelSelector from "./ModelSelector";
import FileUpload from "./FileUpload";
import FilePreview from "./FilePreview";

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  selectedFile: File | null;
  setSelectedFile: (file: File) => void;
  onRemoveFile: () => void;
  onUploadError: (errMsg: string) => void;
  uploadProgress: number;
  uploadStatus: "idle" | "processing" | "success" | "error";
  uploadError: string | null;
}

export default function ChatInput({
  input,
  setInput,
  selectedModel,
  onModelChange,
  onSubmit,
  loading,
  selectedFile,
  setSelectedFile,
  onRemoveFile,
  onUploadError,
  uploadProgress,
  uploadStatus,
  uploadError,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (uploadStatus === "processing") return;
      if ((input.trim() || selectedFile) && !loading) {
        onSubmit(e);
      }
    }
  };

  const isSubmitDisabled =
    (!input.trim() && !selectedFile) ||
    loading ||
    uploadStatus === "processing";

  return (
    <form onSubmit={onSubmit} className="w-full max-w-4xl mx-auto flex flex-col gap-2 px-4 md:px-0">
      <div className="relative flex flex-col w-full rounded-2xl border border-border-color bg-surface/50 dark:bg-neutral-900/30 backdrop-blur-md focus-within:border-accent focus-within:shadow-md focus-within:shadow-accent/20 transition-all duration-300 shadow-sm">
        {/* Model Selector Bar */}
        <div className="flex items-center justify-between px-3 pt-2.5">
          <ModelSelector selectedModel={selectedModel} onModelChange={onModelChange} />
        </div>

        {/* File Preview */}
        {selectedFile && (
          <div className="px-3 pt-2">
            <FilePreview
              file={selectedFile}
              onRemove={onRemoveFile}
              progress={uploadProgress}
              status={uploadStatus}
              error={uploadError}
            />
          </div>
        )}

        {/* Input Row */}
        <div className="flex items-end gap-3 px-4 py-3.5">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Apex anything..."
            className="flex-1 max-h-[300px] min-h-[48px] py-3 px-1.5 text-[16px] font-sans bg-transparent border-0 focus:ring-0 focus:outline-none resize-none text-foreground placeholder-neutral-450 dark:placeholder-neutral-500 overflow-y-auto leading-normal"
            style={{ height: "auto" }}
          />

          <div className="flex items-center gap-1 shrink-0 pb-0.5">
            <FileUpload
              onFileSelect={setSelectedFile}
              onUploadError={onUploadError}
              selectedFile={selectedFile}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`p-2 rounded-full transition-all duration-200 shrink-0 flex items-center justify-center ${
              !isSubmitDisabled
                ? "bg-accent text-white hover:bg-accent/90 hover:scale-105 active:scale-90 shadow-sm shadow-accent/15"
                : "bg-neutral-200/50 dark:bg-neutral-800/40 text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
            }`}
            title="Send message"
          >
            <ArrowUp className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center px-1 text-[9px] font-mono text-neutral-500 select-none">
        <span className="flex items-center gap-1">
          <CornerDownLeft className="h-2.5 w-2.5" /> enter to send, shift+enter for new line
        </span>
        <span>apex_agent_v1.0.0</span>
      </div>
    </form>
  );
}
