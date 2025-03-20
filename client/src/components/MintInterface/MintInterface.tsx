import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNFTMint } from "@/hooks/useNFTMint";
import { useToast } from "@/hooks/use-toast";
import { useBurns } from "@/hooks/useBurns";
import { useAccount } from "wagmi";
import { Address } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { CollectionMint } from "./CollectionMint";
import { TokenConfigTable } from "./TokenConfigTable";


export function MintInterface() {

  return (
    <div className="space-y-8">
      {/* <CollectionMint /> */}
      <TokenConfigTable />
    </div>
  );
}