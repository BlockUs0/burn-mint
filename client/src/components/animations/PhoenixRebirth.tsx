import { motion } from "framer-motion";

interface Props {
  active: boolean;
}

export function PhoenixRebirth({ active }: Props) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Dark overlay with flames */}
      <motion.div
        className="absolute inset-0 bg-black/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Phoenix symbol */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: [0.8, 1.2, 1],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 3,
          times: [0, 0.5, 1],
          ease: "easeInOut"
        }}
      >
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="text-orange-500"
        >
          <motion.path
            d="M100 20c-20 0-40 10-50 30 10-10 30-15 50-15s40 5 50 15c-10-20-30-30-50-30zM60 140c10 20 25 35 40 40-15-5-30-20-40-40zM140 140c-10 20-25 35-40 40 15-5 30-20 40-40zM100 50c-30 0-60 30-60 60 0 20 10 40 30 50-20-20-20-50 0-70 20-20 50-20 70 0 20 20 20 50 0 70 20-10 30-30 30-50 0-30-30-60-60-60z"
            fill="currentColor"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1,
              opacity: [0, 1, 1, 0],
              scale: [1, 1.1, 1.1, 0.9]
            }}
            transition={{
              duration: 3,
              times: [0, 0.3, 0.7, 1],
              ease: "easeInOut"
            }}
          />
        </svg>
      </motion.div>

      {/* Rising flames */}
      <div className="absolute bottom-0 left-0 right-0 h-96 overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-orange-600 via-red-500 to-transparent"
          animate={{
            y: [0, -100],
            opacity: [0.8, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
      </div>
    </div>
  );
}
