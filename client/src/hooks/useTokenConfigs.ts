import { useQuery } from "@tanstack/react-query";
import { createNFTContractReader } from "@/services/nftMinting";
import { polygon } from "viem/chains";
import type { TokenConfig } from "@/services/nftMinting";

export function useTokenConfigs() {
  return useQuery({
    queryKey: ["tokenConfigs"],
    queryFn: async () => {
      const reader = createNFTContractReader(polygon);
      const tokenIds = await reader.getAllTokenIds();
      
      // Fetch config for each token ID
      const configs = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const config = await reader.getTokenConfig(tokenId);
          return {
            tokenId,
            ...config,
          };
        })
      );
      
      return configs;
    },
  });
}
