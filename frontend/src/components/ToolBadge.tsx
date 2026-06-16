import { Globe, Code, Brain } from "lucide-react";

interface ToolBadgeProps {
  type: "webSearch" | "codeExecution" | "memory";
  label?: string;
}

export default function ToolBadge({ type, label }: ToolBadgeProps) {
  if (type === "webSearch") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/40">
        <Globe className="h-3 w-3 shrink-0 animate-pulse" />
        <span>{label || "🌐 Web Search"}</span>
      </span>
    );
  }

  if (type === "codeExecution") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/40">
        <Code className="h-3 w-3 shrink-0" />
        <span>{label || "💻 Code Execution"}</span>
      </span>
    );
  }

  if (type === "memory") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/20 dark:text-purple-450 dark:border-purple-900/40">
        <Brain className="h-3 w-3 shrink-0" />
        <span>{label || "🧠 Memory Recalled"}</span>
      </span>
    );
  }

  return null;
}
