'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

export function BackToTop() {
  const [visible, setVisible] = useState(false);
 const [scrollPercent, setScrollPercent] = useState(0);
  const isMobile = useIsMobile();
  const initialized = useRef(false);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? Math.round((scrollY / docHeight) * 100) : 0;
    setVisible(scrollY > 300);
    setScrollPercent(percent);
  }, []);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Hide on small mobile viewports
  if (isMobile && typeof window !== 'undefined' && window.innerHeight < 500) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              onClick={scrollToTop}
              className={`fixed bottom-6 right-6 z-50 rounded-full
                ${isMobile ? 'h-9 w-9' : 'h-10 w-10'}
                flex items-center justify-center
                bg-card/60 border border-border/50
                backdrop-blur-xl shadow-lg
                hover:bg-card/80 hover:shadow-xl hover:border-primary/30
                transition-colors duration-200
                fab-pulse
                group`
              }
              initial={{ opacity: 0, scale: 0.8, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              aria-label="Back to top"
            >
              <ArrowUp
                className={`text-muted-foreground group-hover:text-foreground transition-colors ${isMobile ? 'h-4 w-4' : 'h-4.5 w-4.5'}`}
                strokeWidth={2.5}
              />
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs">
            Scroll {scrollPercent}%
          </TooltipContent>
        </Tooltip>
      )}
    </AnimatePresence>
  );
}
