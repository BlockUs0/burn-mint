import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBurns, registerBurn } from "@/services/api";
import { type Address } from "viem";

interface UseBurnsOptions {
  walletAddress?: Address;
  limit?: number;
  page?: number;
}

export function useBurns(options: UseBurnsOptions = {}) {
  const { walletAddress, limit = 10, page = 1 } = options;
  const queryClient = useQueryClient();

  const burnsQuery = useQuery({
    queryKey: ["burns", { walletAddress, limit, page }],
    queryFn: () => getBurns({ walletAddress, limit, page }),
    enabled: !!walletAddress, // Only fetch when wallet address is available
  });

  const burnMutation = useMutation({
    mutationFn: registerBurn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["burns"] });
      console.log("Burn registered successfully, burns data refetched");
    },
  });

  return {
    burns: burnsQuery.data,
    isLoading: burnsQuery.isLoading,
    error: burnsQuery.error,
    registerBurn: burnMutation.mutate,
    isRegistering: burnMutation.isPending,
    refetch: burnsQuery.refetch,
  };
}