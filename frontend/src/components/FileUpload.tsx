"use client";
import React, { useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Paperclip } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onUploadError: (errMsg: string) => void;
  selectedFile: File | null;
}

export default function FileUpload({ onFileSelect, onUploadError, selectedFile }: FileUploadProps) {
  const [isShaking, setIsShaking] = React.useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      if (fileRejections && fileRejections.length > 0) {
        const err = fileRejections[0].errors[0];
        let errMsg = "Invalid file";
        if (err.code === "file-too-large") {
          errMsg = "File is too large (max 10MB)";
        } else if (err.code === "file-invalid-type") {
          errMsg = "Unsupported file type";
        }
        onUploadError(errMsg);
        triggerShake();
        return;
      }
      if (acceptedFiles && acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect, onUploadError]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,  // Prevent click on root
    noKeyboard: true,
    multiple: false,
    maxSize: 10 * 1024 * 1024,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
      "text/javascript": [".js"],
      "text/typescript": [".ts"],
      "application/json": [".json"],
      "text/x-python": [".py"],
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    open();
  };

  return (
    <div {...getRootProps()} className="shrink-0 flex items-center justify-center">
      <input {...getInputProps()} />
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        className={`p-2.5 rounded-full transition-all duration-200 shrink-0 active:scale-90 flex items-center justify-center ${
          isShaking
            ? "animate-shake text-red-500 bg-red-550/10 border border-red-500"
            : ""
        } ${
          selectedFile
            ? "text-accent bg-accent/10 hover:bg-accent/15"
            : "text-neutral-450 dark:text-neutral-400 hover:text-foreground hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60"
        }`}
        title="Attach file (Images, PDF, Text/Code files, Max 10MB)"
      >
        <Paperclip className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}
