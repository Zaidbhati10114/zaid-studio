"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, X } from "lucide-react";

const CAL_LINK = "https://cal.com/zaidbhati07/30min";

export default function BookingBar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show bar after user scrolls past the hero
    const onScroll = () => {
      if (window.scrollY > 500 && !dismissed) setVisible(true);
      else if (window.scrollY <= 500) setVisible(false);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/90 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur-xl">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <CalendarDays className="size-4" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium">Not sure where to start?</p>
              <p className="text-[11px] text-muted-foreground">
                Book a free 30-min call
              </p>
            </div>
            <a
              href={CAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Book a Free Call
            </a>
            <button
              onClick={() => setDismissed(true)}
              className="flex size-6 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
