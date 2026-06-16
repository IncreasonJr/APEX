"use client";

import { useEffect, useState } from "react";
import { File, FileText, FileCode, X, Check, AlertCircle } from "lucide-react";

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
  progress: number;
  status: "idle" | "processing" | "success" | "error";
  error: string | null;
}

export default function FilePreview({ file, onRemove, progress, status, error }: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const isImage = file.type.startsWith("image/");

  useEffect(() => {
    if (isImage) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file, isImage]);

  const getFileIcon = () => {
    const name = file.name.toLowerCase();
    if (name.endsWith(".py") || name.endsWith(".js") || name.endsWith(".ts") || name.endsWith(".json")) {
      return <FileCode className="h-4.5 w-4.5 text-accent shrink-0" />;
    }
    if (name.endsWith(".txt") || name.endsWith(".md")) {
      return <FileText className="h-4.5 w-4.5 text-neutral-400 shrink-0" />;
    }
    return <File className="h-4.5 w-4.5 text-neutral-450 shrink-0" />;
  };

  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const getContainerStyle = () => {
    switch (status) {
      case "error":
        return "animate-shake border-red-500/50 bg-red-500/5";
      case "success":
        return "border-emerald-500/30 bg-emerald-500/5";
      case "processing":
        return "border-accent/30 bg-accent/5";
      default:
        return "border-border bg-surface/50";
    }
  };

  return (
    <div className={`flex flex-col gap-2 p-2.5 rounded-lg border max-w-[280px] group animate-in fade-in duration-200 shadow-sm ${getContainerStyle()}`}>
      <div className="flex items-center gap-3">
        {/* File Indicator */}
        {isImage && previewUrl ? (
          <div className="relative h-9 w-9 rounded overflow-hidden border border-border shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={file.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-9 w-9 rounded bg-background flex items-center justify-center shrink-0 border border-border">
            {getFileIcon()}
          </div>
        )}

        {/* File Metadata */}
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-[11px] font-mono font-semibold text-foreground truncate leading-none">
            {file.name}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 font-mono text-[9px] font-bold">
            {status === "error" ? (
              <span className="text-red-500 flex items-center gap-0.5">
                <AlertCircle className="h-3 w-3 shrink-0" /> err
              </span>
            ) : status === "success" ? (
              <span className="text-emerald-500 flex items-center gap-0.5 animate-in zoom-in-50 duration-150">
                <Check className="h-3 w-3 shrink-0" /> ready
              </span>
            ) : status === "processing" ? (
              <span className="text-accent animate-pulse">
                loading...
              </span>
            ) : (
              <span className="text-neutral-450 dark:text-neutral-500">
                {formatBytes(file.size)}
              </span>
            )}
          </div>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={onRemove}
          className="p-1 rounded text-neutral-500 hover:text-foreground hover:bg-surface border border-transparent hover:border-border transition-all shrink-0"
          title="Remove file"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Progress Bar */}
      {status === "processing" && (
        <div className="w-full bg-border h-1 rounded overflow-hidden">
          <div
            className="bg-accent h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {status === "error" && error && (
        <p className="text-[9px] font-mono text-red-500 leading-normal font-semibold pl-0.5">
          {error.toLowerCase()}
        </p>
      )}
    </div>
  );
}
