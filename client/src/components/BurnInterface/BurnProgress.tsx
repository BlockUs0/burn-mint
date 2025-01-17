import { useBurnState } from "@/hooks/useBurnState";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { PhoenixRebirth } from "../animations/PhoenixRebirth";

export function BurnProgress() {
  const { status, burnCount } = useBurnState();

  if (status === 'idle') return null;

  return (
    <>
      <PhoenixRebirth active={status === 'burning'} />

      <motion.div 
        className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-orange-500/20"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
      >
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {status === 'burning' ? 'Phoenix Rising...' : 'Transformation Complete'}
            </span>
            <span className="text-sm text-orange-500">
              {burnCount} NFTs transformed
            </span>
          </div>
          <Progress 
            value={status === 'completed' ? 100 : 66} 
            className="h-2 bg-muted"
          />
        </div>
      </motion.div>
    </>
  );
}