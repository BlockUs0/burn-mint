import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTokenConfigs } from "@/hooks/useTokenConfigs";

export function TokenConfigTable() {
  const { data: tokenConfigs, isLoading: isLoadingConfigs } = useTokenConfigs();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Available Token Types</CardTitle>
        <CardDescription>
          Current token configurations in the contract
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingConfigs ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : tokenConfigs && tokenConfigs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Max Supply</TableHead>
                <TableHead>Price (ETH)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokenConfigs.map((config) => (
                <TableRow key={config.tokenId.toString()}>
                  <TableCell className="font-mono">
                    {config.tokenId.toString()}
                  </TableCell>
                  <TableCell>{config.name}</TableCell>
                  <TableCell>
                    {config.maxSupply === BigInt(0) 
                      ? "Unlimited" 
                      : config.maxSupply.toString()}
                  </TableCell>
                  <TableCell>
                    {(Number(config.price) / 1e18).toFixed(4)}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      config.active 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {config.active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {config.soulbound ? "Soulbound" : "Transferable"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No token configurations found
          </div>
        )}
      </CardContent>
    </Card>
  );
}
