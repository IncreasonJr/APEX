"use client";

import React, { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface ScrollToBottomProps {
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export default function ScrollToBottom({ scrollRef }: ScrollToBottomProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Show button if the user scrolls up more than 300px from the bottom
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 300;
      setShow(!isNearBottom);
    };

    // Check on mount or ref change in case it loads scrolled up
    handleScroll();

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [scrollRef]);

  const handleScrollToBottom = () => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          onClick={handleScrollToBottom}
          className="absolute right-6 bottom-24 p-3 rounded-full bg-white dark:bg-neutral-800 border border-neutral-250 dark:border-neutral-700 shadow-md hover:shadow-lg hover:bg-neutral-50 dark:hover:bg-neutral-750 text-neutral-600 dark:text-neutral-305 transition-all z-35 flex items-center justify-center border-neutral-200"
          title="Scroll to bottom"
        >
          <ArrowDown className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
