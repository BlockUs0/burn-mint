import { useQuery } from "@tanstack/react-query";
import { createNFTContractReader } from "@/services/nftMinting";
import type { TokenConfig } from "@/services/nftMinting";
import { getCurrentChain } from "@/services/web3";
import { useAccount, useChainId } from "wagmi";

export function useTokenConfigs() {
  const chainId = useChainId();

  return useQuery({
    queryKey: ["tokenConfigs", chainId],
    queryFn: async () => {
      const chain = await getCurrentChain();
      const reader = createNFTContractReader(chain);
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