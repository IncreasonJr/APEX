"use client";
import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Globe, Code, Brain } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Message } from "@/lib/api";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ContextIndicator from "./ContextIndicator";
import ScrollToBottom from "./ui/ScrollToBottom";

interface ChatInterfaceProps {
  onNewChatRef: React.MutableRefObject<(() => void) | null>;
  activeFilePath: string | null;
  activeFileContent: string | null;
  onClearActiveFile: () => void;
}

const SEARCH_KEYWORDS = [
  "news", "latest", "recent", "today", "this week",
  "what is", "who is", "where is", "when is", "why is",
  "tell me about", "find me", "look up",
  "current events", "updates", "announcement",
  "developments", "breakthrough", "discovery", "research",
  "weather", "temperature", "forecast", "climate",
  "quantum", "computing", "scientific", "breakthrough"
];

const CODE_KEYWORDS = [
  "write code", "run this", "execute", "python script", "multiply", "reverse", "script", "calculate"
];

const SUGGESTIONS = [
  {
    title: "Quantum computing info",
    text: "What are the latest developments in quantum computing?",
    icon: Globe,
  },
  {
    title: "Weather check",
    text: "What is the weather like in London today?",
    icon: Globe,
  },
  {
    title: "Sandboxed math calculation",
    text: "Write and run a Python script to multiply 12 by 8",
    icon: Code,
  },
  {
    title: "Remember user details",
    text: "My favorite color is blue and I work as a software engineer",
    icon: Brain,
  },
];

const readFileContent = (file: File): Promise<{ url?: string; content?: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    if (file.type.startsWith("image/")) {
      reader.onload = () => {
        resolve({ url: reader.result as string });
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    } else {
      const name = file.name.toLowerCase();
      const isTextFile =
        name.endsWith(".py") ||
        name.endsWith(".js") ||
        name.endsWith(".ts") ||
        name.endsWith(".json") ||
        name.endsWith(".txt") ||
        name.endsWith(".md") ||
        file.type.startsWith("text/");
      if (isTextFile) {
        reader.onload = () => {
          resolve({ content: reader.result as string });
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      } else {
        reader.onload = () => {
          resolve({ content: reader.result as string });
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      }
    }
  });
};

export default function ChatInterface({
  onNewChatRef,
  activeFilePath,
  activeFileContent,
  onClearActiveFile,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processedFileContent, setProcessedFileContent] = useState<{ url?: string; content?: string } | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onNewChatRef.current = () => {
      setMessages([]);
      setInput("");
      handleRemoveFile();
      setLoading(false);
      setStreamingMessageId(null);
    };
  }, [onNewChatRef]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setUploadProgress(0);
    setUploadStatus("processing");
    setUploadError(null);
    setProcessedFileContent(null);
    try {
      const result = await readFileContent(file);
      setUploadProgress(100);
      setUploadStatus("success");
      setProcessedFileContent(result);
    } catch (err: any) {
      console.error("FileReader failed:", err);
      setUploadStatus("error");
      setUploadError(err.message || "Failed to parse file content");
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStatus("idle");
    setUploadError(null);
    setProcessedFileContent(null);
  };

  const handleUploadError = (errMsg: string) => {
    setUploadStatus("error");
    setUploadError(errMsg);
  };

  const onDrop = (acceptedFiles: File[], fileRejections: any[]) => {
    if (fileRejections && fileRejections.length > 0) {
      const err = fileRejections[0].errors[0];
      let errMsg = "Invalid file";
      if (err.code === "file-too-large") {
        errMsg = "File is too large (max 10MB)";
      } else if (err.code === "file-invalid-type") {
        errMsg = "Unsupported file type";
      }
      handleUploadError(errMsg);
      return;
    }
    if (acceptedFiles && acceptedFiles.length > 0) {
      handleFileSelect(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || loading || uploadStatus === "processing") return;

    const userMessageText = input;
    const fileToProcess = selectedFile;
    const fileContent = processedFileContent;
    setInput("");
    handleRemoveFile();
    setLoading(true);

    const userMessageId = Math.random().toString(36).substring(7);
    const aiMessageId = Math.random().toString(36).substring(7);

    const queryLower = userMessageText.toLowerCase();
    const isSearch = SEARCH_KEYWORDS.some((kw) => queryLower.includes(kw));
    const isCode = CODE_KEYWORDS.some((kw) => queryLower.includes(kw));
    const isMemory = true;

    let attachedFileMetadata: Message["attachedFile"] = undefined;
    let finalMessageText = userMessageText;

    if (fileToProcess && fileContent) {
      if (fileToProcess.type.startsWith("image/")) {
        attachedFileMetadata = {
          name: fileToProcess.name,
          size: fileToProcess.size,
          type: fileToProcess.type,
          url: fileContent.url,
        };
        finalMessageText = userMessageText
          ? `${userMessageText}\n\n[Image: ${fileContent.url}]`
          : `[Image: ${fileContent.url}]`;
      } else {
        const isText = fileToProcess.name.endsWith(".txt") || fileToProcess.name.endsWith(".md") ||
          fileToProcess.name.endsWith(".py") || fileToProcess.name.endsWith(".js") ||
          fileToProcess.name.endsWith(".ts") || fileToProcess.name.endsWith(".json") ||
          fileToProcess.type.startsWith("text/");
        if (isText) {
          attachedFileMetadata = {
            name: fileToProcess.name,
            size: fileToProcess.size,
            type: fileToProcess.type,
            content: fileContent.content,
          };
          finalMessageText = userMessageText
            ? `${userMessageText}\n\n[Attached File: ${fileToProcess.name}]\nContent:\n${fileContent.content}`
            : `[Attached File: ${fileToProcess.name}]\nContent:\n${fileContent.content}`;
        } else {
          attachedFileMetadata = {
            name: fileToProcess.name,
            size: fileToProcess.size,
            type: fileToProcess.type,
            url: fileContent.content,
          };
          finalMessageText = userMessageText
            ? `${userMessageText}\n\n[Attached File (Base64): ${fileToProcess.name}]\nContent:\n${fileContent.content}`
            : `[Attached File (Base64): ${fileToProcess.name}]\nContent:\n${fileContent.content}`;
        }
      }
    }

    const userMsgObj: Message = {
      id: userMessageId,
      role: "user",
      content: userMessageText || (fileToProcess ? `Attached file: ${fileToProcess.name}` : ""),
      attachedFile: attachedFileMetadata,
    };

    const initialAiMsgObj: Message = {
      id: aiMessageId,
      role: "assistant",
      content: "",
      modelUsed: selectedModel === "auto" ? "Llama 4" : selectedModel,
      toolsUsed: {
        webSearch: isSearch,
        codeExecution: isCode,
        memory: isMemory,
      },
    };

    setMessages((prev) => [...prev, userMsgObj, initialAiMsgObj]);
    setStreamingMessageId(aiMessageId);

    // Extract base64 from data URL
    let imageBase64 = null;
    if (fileToProcess && fileToProcess.type.startsWith("image/") && fileContent?.url) {
      imageBase64 = fileContent.url.split(',')[1];
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: imageBase64 ? userMessageText : finalMessageText,
          model_choice: selectedModel,
          image: imageBase64,
          active_file_path: activeFilePath,
          active_file_content: activeFileContent,
        }),
      });

      if (!response.ok) throw new Error(`Proxy call failed: ${response.statusText}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      if (!reader) throw new Error("No readable stream reader available");

      let buffer = "";
      let completedText = "";
      let modelUsedFromBackend = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          if (line.startsWith("event: ")) continue;
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") continue;
            try {
              const dataObj = JSON.parse(dataStr);
              if (dataObj.model_used) {
                modelUsedFromBackend = dataObj.model_used;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMessageId ? { ...msg, modelUsed: modelUsedFromBackend } : msg
                  )
                );
              } else if (dataObj.content) {
                completedText += dataObj.content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMessageId ? { ...msg, content: completedText } : msg
                  )
                );
              } else if (dataObj.error) {
                completedText += `\n[Error: ${dataObj.error}]`;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMessageId ? { ...msg, content: completedText } : msg
                  )
                );
              }
            } catch (err) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Submission failed:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId ? { ...msg, content: `Error: ${err.message}` } : msg
        )
      );
    } finally {
      setLoading(false);
      setStreamingMessageId(null);
    }
  };

  const handleSuggestionClick = (suggestionText: string) => {
    setInput(suggestionText);
  };

  return (
    <div {...getRootProps()} className="flex-1 flex flex-col h-screen overflow-hidden bg-background relative">
      <input {...getInputProps()} />
      {isDragActive && (
        <div className="absolute inset-0 bg-accent/5 backdrop-blur-sm border-2 border-dashed border-accent m-4 flex flex-col items-center justify-center gap-3 z-50 animate-in fade-in duration-200 pointer-events-none rounded-lg">
          <div className="p-4 rounded bg-accent/15 text-accent">
            <svg className="h-9 w-9 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-xs font-mono font-bold text-foreground">DROP_ATTACHMENT_HERE</p>
        </div>
      )}

      {/* Main chat viewport container */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto relative scroll-smooth flex flex-col min-h-0">
        {messages.length > 0 && <div className="altimeter-line" />}
        
        {messages.length === 0 ? (
          <div className="max-w-4xl mx-auto px-6 md:px-0 flex-1 flex flex-col justify-center w-full items-center text-center py-4 overflow-hidden">
            {activeFilePath && (
              <div className="w-full max-w-2xl mb-6 shrink-0">
                <ContextIndicator activeFilePath={activeFilePath} onClear={onClearActiveFile} />
              </div>
            )}

            <div className="flex flex-col items-center justify-center select-none text-center w-full py-2 shrink-0">
              <div className="mb-4 relative flex items-center justify-center">
                {/* Ambient glow matching the electric blue accent */}
                <div className="absolute w-24 h-24 bg-[#2560e0]/20 rounded-full blur-2xl pointer-events-none" />
                <img src="/logo.png" className="h-20 w-20 object-contain relative z-10 select-none pointer-events-none drop-shadow-2xl" alt="Apex Logo" />
              </div>
              <h1 className="font-sans font-black tracking-tighter mb-4 bg-gradient-to-r from-[#2560e0] via-[#5c7cff] to-[#60a5fa] bg-clip-text text-transparent leading-none select-none py-0.5" style={{ fontSize: 'clamp(3.5rem, 8vw, 6rem)' }}>
                Apex
              </h1>
              <p className="font-sans font-medium text-neutral-450 dark:text-neutral-400 tracking-tight leading-normal max-w-2xl mx-auto" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.45rem)' }}>
                Hello developer, what do you want to build?
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl mx-auto py-6 flex-1 flex flex-col">
            {activeFilePath && (
              <div className="px-4 w-full shrink-0">
                <ContextIndicator activeFilePath={activeFilePath} onClear={onClearActiveFile} />
              </div>
            )}
            
            <div className="flex-1 relative">
              {/* Thread Line connecting related messages */}
              <div className="absolute left-[31px] top-6 bottom-6 w-[1.5px] bg-border-color pointer-events-none z-0" />
              
              <div className="relative z-10">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </div>
            </div>

            {loading && streamingMessageId === null && (
              <div className="flex gap-3.5 p-4 border-b border-border-color/10 justify-start items-start w-full font-sans animate-in fade-in duration-200 relative">
                {/* Thread connector line for thinking bubble */}
                <div className="absolute left-[31px] -top-6 bottom-6 w-[1.5px] bg-border-color pointer-events-none z-0" />
                
                <div className="h-7.5 w-7.5 rounded-full bg-surface flex items-center justify-center shrink-0 border border-border-color select-none mt-0.5 z-10">
                  <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
                </div>
                <div className="flex-1 flex flex-col gap-1.5 overflow-hidden z-10 mt-0.5">
                  <div className="p-3.5 bg-[var(--surface)] border border-border-color rounded-2xl text-neutral-400 max-w-fit leading-relaxed text-sm flex items-center gap-3 select-none shadow-sm">
                    <span>Apex is thinking</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent dot-1"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-accent dot-2"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-accent dot-3"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <ScrollToBottom scrollRef={chatContainerRef} />
      <div className="p-4 border-t border-border-color bg-background/80 backdrop-blur-md shrink-0">
        <ChatInput
          input={input}
          setInput={setInput}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onSubmit={handleSubmit}
          loading={loading}
          selectedFile={selectedFile}
          setSelectedFile={handleFileSelect}
          onRemoveFile={handleRemoveFile}
          onUploadError={handleUploadError}
          uploadProgress={uploadProgress}
          uploadStatus={uploadStatus}
          uploadError={uploadError}
        />
      </div>
    </div>
  );
}
