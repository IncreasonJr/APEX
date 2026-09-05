"use client";

import { useState } from "react";
import { ChevronDown, Sparkles, Brain, Microscope, Code } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const MODELS = [
  {
    id: "auto",
    name: "auto_router",
    desc: "Optimal routing based on prompt intent",
    icon: Sparkles,
    iconColor: "text-accent",
  },
  {
    id: "meta/llama-3.2-11b-vision-instruct",
    name: "llama_3.2_vision",
    desc: "Multimodal instruction model for text and vision",
    icon: Brain,
    iconColor: "text-neutral-400",
  },
];

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentModel = MODELS.find((m) => m.id === selectedModel) || MODELS[0];
  const CurrentIcon = currentModel.icon;

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-3.5 md:px-2.5 py-2.5 md:py-0 h-11 md:h-7 rounded border border-border bg-surface/40 hover:bg-surface text-xs md:text-[10px] font-mono text-neutral-400 hover:text-foreground transition-all duration-150"
        >
          <CurrentIcon className={`h-3 w-3 ${currentModel.iconColor} shrink-0`} />
          <span>{currentModel.name}</span>
          <ChevronDown className={`h-3 w-3 opacity-60 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="absolute left-0 bottom-full mb-2 z-30 w-64 rounded-lg border border-border bg-surface shadow-lg overflow-hidden focus:outline-none"
            >
              <div className="p-1.5 flex flex-col gap-0.5">
                {MODELS.map((model) => {
                  const ItemIcon = model.icon;
                  const isSelected = model.id === selectedModel;
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        onModelChange(model.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-3 md:p-2 rounded text-xs md:text-[10px] font-mono transition-all flex items-start gap-2.5 hover:bg-background border ${
                        isSelected
                          ? "text-accent bg-background border-border"
                          : "text-neutral-450 hover:text-foreground border-transparent hover:translate-x-0.5"
                      }`}
                    >
                      <ItemIcon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${isSelected ? "text-accent" : "text-neutral-500"}`} />
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-bold">{model.name}</span>
                        <span className="text-[9px] opacity-60 leading-normal font-semibold">
                          {model.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
