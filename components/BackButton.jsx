"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <button
      onClick={handleBack}
      className="fixed cursor-pointer left-0 bottom-3 -translate-y-1/2 z-50 bg-gradient-to-r from-sky-300 via-sky-400 to-sky-600 text-white p-2 pr-2 pl-1 rounded-r-full shadow-xl hover:opacity-90 transition-all flex items-center space-x-1"
      aria-label="Go back"
      title="Go back"
    >
      <motion.span
        animate={{ x: [0, -5, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="text-white"
      >
       <i style={{fontSize:"25px"}}> &#8592;</i>
      </motion.span>
      <span className="animate-text-blink font-extrabold"></span>
    </button>
  );
}
