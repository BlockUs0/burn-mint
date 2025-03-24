import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SessionTimer() {
  const { timeRemaining, sessionExpiry, refreshSession, isAuthenticated } = useAuth();
  const [formattedTime, setFormattedTime] = useState<string>('');
  
  // Don't show the timer if not authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  // Format the time remaining for display
  useEffect(() => {
    if (timeRemaining !== null) {
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;
      setFormattedTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    } else {
      setFormattedTime('--:--');
    }
  }, [timeRemaining]);
  
  // Determine the color based on time remaining
  const getTimerColor = () => {
    if (!timeRemaining) return 'text-gray-400';
    if (timeRemaining <= 300) return 'text-red-500'; // Less than 5 minutes
    if (timeRemaining <= 600) return 'text-amber-500'; // Less than 10 minutes
    return 'text-green-500';
  };
  
  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/80 border shadow-sm">
      <div className="flex items-center gap-1">
        <Clock className={cn("h-4 w-4", getTimerColor())} />
        <span className={cn("text-sm font-medium", getTimerColor())}>
          {formattedTime}
        </span>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-xs h-6 px-2 hover:bg-primary/10"
        onClick={refreshSession}
      >
        Refresh
      </Button>
    </div>
  );
}