'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAdminStore } from '@/stores/admin';
import React from 'react';

const pageVariants = {
  initial: { opacity: 0, y: 12, scale: 0.998, filter: 'blur(4px)' },
  in: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  out: { opacity: 0, y: -8, scale: 0.998, filter: 'blur(4px)' },
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'easeInOut' as const,
  duration: 0.25,
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const { currentPage } = useAdminStore();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="gradient-wipe will-change-[transform,opacity,filter]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
