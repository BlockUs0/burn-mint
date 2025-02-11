
import { useMutation } from "@tanstack/react-query";
import { mintNFT } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export function useNFTMint() {
  const { toast } = useToast();

  const {
    mutateAsync: mint,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: ({
      collectionId,
      tokenId,
      quantity = 1,
    }: {
      collectionId: string;
      tokenId: string;
      quantity?: number;
    }) => mintNFT(collectionId, tokenId, quantity),
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error minting NFT",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    },
  });

  return {
    mint,
    isLoading,
    error,
  };
}
