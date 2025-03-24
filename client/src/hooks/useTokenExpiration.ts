import { useToast } from './use-toast';

export function useTokenExpiration() {
  const { toast } = useToast();

  const showExpirationToast = () => {
    toast({
      variant: "destructive",
      title: "Session Expired",
      description: "Your authentication has expired. Please log in again.",
    });
  };

  const showExpirationWarningToast = (secondsLeft: number) => {
    toast({
      variant: "default",
      title: "Session Expiring Soon",
      description: `Your session will expire in approximately ${secondsLeft} seconds. Please re-authenticate if you need to continue.`,
    });
  };

  return {
    showExpirationToast,
    showExpirationWarningToast
  };
}