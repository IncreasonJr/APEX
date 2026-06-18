"use client";

import { Sparkles, User, Copy, Check, File, FileText, FileCode, Edit2 } from "lucide-react";
import { useState } from "react";
import { Message } from "@/lib/api";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import ToolBadge from "./ToolBadge";

interface ChatMessageProps {
  message: Message;
  fileWriteStatuses?: Record<string, "pending" | "approved" | "cancelled">;
  onOpenFileWriteRequest?: (path: string, content: string) => void;
}

export default function ChatMessage({
  message,
  fileWriteStatuses = {},
  onOpenFileWriteRequest,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Entrance animation
  const variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 2,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const renderAttachment = (file: NonNullable<Message["attachedFile"]>) => {
    const isImage = file.type.startsWith("image/");

    if (isImage && file.url) {
      return (
        <div className="relative max-w-sm rounded-md overflow-hidden border border-border-color bg-surface shadow-sm mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={file.url}
            alt={file.name}
            className="max-h-60 object-contain w-full rounded-md"
          />
        </div>
      );
    }

    const formatBytes = (bytes: number, decimals = 1) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const getIcon = () => {
      const name = file.name.toLowerCase();
      if (name.endsWith(".py") || name.endsWith(".js") || name.endsWith(".ts") || name.endsWith(".json")) {
        return <FileCode className="h-4 w-4 text-accent shrink-0" />;
      }
      if (name.endsWith(".txt") || name.endsWith(".md")) {
        return <FileText className="h-4 w-4 text-neutral-400 shrink-0" />;
      }
      return <File className="h-4 w-4 text-neutral-400 shrink-0" />;
    };

    return (
      <div className="flex items-center gap-3 p-3 rounded-xl border border-border-color bg-surface/40 backdrop-blur-sm max-w-[280px] mb-2 font-sans">
        <div className="h-8.5 w-8.5 rounded-lg bg-neutral-900/40 flex items-center justify-center shrink-0 border border-border-color">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-xs font-semibold text-foreground truncate leading-none">
            {file.name}
          </p>
          <p className="text-[10px] text-neutral-450 dark:text-neutral-500 font-semibold mt-1.5">
            {formatBytes(file.size)}
          </p>
        </div>
      </div>
    );
  };

  const renderContent = (content: string) => {
    if (!content) return null;

    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const lang = match ? match[1] : "code";
        const code = match ? match[2].trim() : part.slice(3, -3).trim();

        return (
          <div key={index} className="my-2.5 border border-border-color rounded-md overflow-hidden font-mono text-xs max-w-full">
            <div className="flex justify-between items-center px-3 py-1.5 bg-neutral-900/90 border-b border-border-color text-neutral-400 font-mono text-[10px] select-none">
              <span>{lang || "code"}</span>
              <button
                onClick={() => handleCopyCode(code)}
                className="flex items-center gap-1 hover:text-foreground transition-colors py-0.5 px-1.5 rounded border border-transparent hover:border-border-color hover:bg-background"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <motion.span
                      key="copied"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="flex items-center gap-1 text-accent font-semibold"
                    >
                      <Check className="h-3 w-3" />
                      <span>Copied!</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="flex items-center gap-1 font-semibold"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
            <div className="bg-neutral-950/80 text-foreground overflow-x-auto select-text font-mono">
              <SyntaxHighlighter
                language={(lang || "code").toLowerCase()}
                style={tomorrow}
                customStyle={{
                  margin: 0,
                  padding: "0.75rem",
                  background: "transparent",
                  fontSize: "11px",
                  lineHeight: "1.5",
                }}
                PreTag="div"
              >
                {code}
              </SyntaxHighlighter>
            </div>
          </div>
        );
      }

      const lines = part.split("\n");
      return lines.map((line, lineIdx) => {
        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
          const listText = line.replace(/^[\s*-]+/, "");
          return (
            <ul key={`${lineIdx}`} className="list-disc pl-5 my-1 leading-relaxed text-[16px] md:text-[15px]">
              <li>{parseInlineFormatting(listText)}</li>
            </ul>
          );
        }

        const numMatch = line.trim().match(/^\d+\.\s(.*)/);
        if (numMatch) {
          return (
            <ol key={`${lineIdx}`} className="list-decimal pl-5 my-1 leading-relaxed text-[16px] md:text-[15px]">
              <li>{parseInlineFormatting(numMatch[1])}</li>
            </ol>
          );
        }

        return (
          <p key={`${lineIdx}`} className="min-h-[1.2rem] leading-relaxed my-1 text-[16px] md:text-[15px]">
            {parseInlineFormatting(line)}
          </p>
        );
      });
    });
  };

  const parseInlineFormatting = (text: string) => {
    const boldAndCodeParts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

    return boldAndCodeParts.map((subPart, subIdx) => {
      if (subPart.startsWith("**") && subPart.endsWith("**")) {
        return <strong key={subIdx} className="font-bold text-foreground">{subPart.slice(2, -2)}</strong>;
      }
      if (subPart.startsWith("`") && subPart.endsWith("`")) {
        return <code key={subIdx} className="px-1.5 py-0.5 rounded bg-neutral-900 border border-border-color text-[12px] font-mono text-accent">{subPart.slice(1, -1)}</code>;
      }
      return subPart;
    });
  };

  const parseMessageBlocks = (text: string) => {
    const blocks: { type: "text" | "file_write"; path?: string; content: string; isStreaming?: boolean }[] = [];
    let lastIndex = 0;
    
    while (true) {
      const startIdx = text.indexOf("<<<WRITE_FILE:", lastIndex);
      if (startIdx === -1) {
        const remainder = text.substring(lastIndex);
        if (remainder.trim() || blocks.length === 0) {
          blocks.push({ type: "text", content: remainder });
        }
        break;
      }
      
      const textBefore = text.substring(lastIndex, startIdx);
      if (textBefore.trim()) {
        blocks.push({ type: "text", content: textBefore });
      }
      
      const newlineIdx = text.indexOf("\n", startIdx);
      if (newlineIdx === -1) {
        const path = text.substring(startIdx + 14);
        blocks.push({ type: "file_write", path, content: "", isStreaming: true });
        break;
      }
      
      const path = text.substring(startIdx + 14, newlineIdx).trim();
      const endIdx = text.indexOf(">>>", newlineIdx);
      
      if (endIdx === -1) {
        const content = text.substring(newlineIdx + 1);
        blocks.push({ type: "file_write", path, content, isStreaming: true });
        break;
      }
      
      const content = text.substring(newlineIdx + 1, endIdx);
      blocks.push({ type: "file_write", path, content, isStreaming: false });
      lastIndex = endIdx + 3;
    }
    
    return blocks;
  };

  const renderFileWriteCard = (path: string, blockContent: string, isStreaming: boolean) => {
    const status = fileWriteStatuses[path] || "pending";
    
    const getStatusStyles = () => {
      switch (status) {
        case "approved":
          return {
            border: "border-green-500/30 bg-green-950/10",
            text: "text-green-400",
            label: "✓ Written to Disk"
          };
        case "cancelled":
          return {
            border: "border-red-500/30 bg-red-950/10",
            text: "text-red-400",
            label: "✗ Declined"
          };
        default:
          return {
            border: isStreaming ? "border-accent/30 bg-accent/5 animate-pulse" : "border-accent/40 bg-accent/10",
            text: "text-accent",
            label: isStreaming ? "✍ Writing file..." : "⚡ Pending Approval"
          };
      }
    };
    
    const styles = getStatusStyles();
    
    return (
      <div className={`flex flex-col p-4 rounded-xl border ${styles.border} max-w-md my-3.5 font-sans shadow-sm`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400">
            PROPOSED FILE
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-900 border border-border-color uppercase ${styles.text}`}>
            {styles.label}
          </span>
        </div>
        
        <div className="flex items-center gap-3 bg-neutral-950/40 p-3 rounded-lg border border-border-color/40 mb-3.5">
          <FileCode className="h-5 w-5 text-accent shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground truncate select-all" title={path}>
              {path}
            </p>
            <p className="text-[10px] text-neutral-450 dark:text-neutral-500 font-semibold mt-1">
              {blockContent.split("\n").length} lines • {blockContent.length} chars
            </p>
          </div>
        </div>
        
        {!isStreaming && status === "pending" && onOpenFileWriteRequest && (
          <button
            onClick={() => onOpenFileWriteRequest(path, blockContent)}
            className="w-full h-9 bg-accent hover:bg-accent/90 text-white rounded-lg text-xs uppercase font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-accent/10"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Inspect & Approve
          </button>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      className={`flex gap-4 p-4 hover:bg-neutral-800/5 transition-colors duration-150 border-b border-border-color/10 w-full relative ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* AI Avatar on Left */}
      {!isUser && (
        <div className="h-7.5 w-7.5 rounded-full bg-surface/80 flex items-center justify-center shrink-0 border border-border-color select-none mt-0.5 shadow-sm z-10">
          <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
        </div>
      )}

      {/* Message Content Container */}
      <div className={`flex flex-col gap-1 overflow-hidden ${isUser ? "max-w-[75%] items-end" : "max-w-[80%] items-start"}`}>
        {/* Attached files */}
        {isUser && message.attachedFile && (
          <div className="mt-1 w-full flex justify-end">
            {renderAttachment(message.attachedFile)}
          </div>
        )}

        {/* Content bubble / plain text */}
        {message.content && (
          <div className="w-full mt-0.5 flex flex-col gap-2">
            {isUser ? (
              <div className="p-3.5 bg-[var(--user-msg-bg)] border border-border-color rounded-2xl text-foreground max-w-fit leading-relaxed shadow-sm text-left">
                {renderContent(message.content)}
              </div>
            ) : (
              parseMessageBlocks(message.content).map((block, bIdx) => {
                if (block.type === "file_write") {
                  return (
                    <div key={bIdx}>
                      {renderFileWriteCard(block.path || "unnamed_file", block.content, !!block.isStreaming)}
                    </div>
                  );
                }
                return (
                  <div key={bIdx} className="p-3.5 bg-[var(--surface)] border border-border-color rounded-2xl text-foreground max-w-fit leading-relaxed shadow-sm text-left">
                    {renderContent(block.content)}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tools indicators */}
        {!isUser && message.toolsUsed && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.toolsUsed.webSearch && <ToolBadge type="webSearch" />}
            {message.toolsUsed.codeExecution && <ToolBadge type="codeExecution" />}
            {message.toolsUsed.memory && <ToolBadge type="memory" />}
          </div>
        )}
      </div>

      {/* User Avatar on Right */}
      {isUser && (
        <div className="h-7.5 w-7.5 rounded-full bg-surface flex items-center justify-center shrink-0 border border-border-color select-none mt-0.5 shadow-sm z-10">
          <User className="h-3.5 w-3.5 text-neutral-400" />
        </div>
      )}
    </motion.div>
  );
}

