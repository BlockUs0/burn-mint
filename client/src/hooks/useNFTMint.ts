import { useMutation } from "@tanstack/react-query";
import { mintNFT } from "@/services/auth";
import { useToast } from "@/hooks/use-toast";

export function useNFTMint() {
  const { toast } = useToast();

  const {
    mutate: mint,
    isLoading,
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
    onSuccess: () => {
      toast({
        title: "Success",
        description: "NFT minted successfully",
      });
    },
  });

  return {
    mint,
    isLoading,
    error,
  };
}
