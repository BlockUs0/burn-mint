import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { Address, hexToNumber } from "viem"

interface BurnProof {
  type: string
  txHash: string
}

interface BurnRecord {
  tokenId: string
  chain: string
  walletAddress: string
  timestamp: number
  burnProof: BurnProof
  status: string
  collectionContractAddress: Address
}

interface BurnHistoryProps {
  burns: BurnRecord[]
}

export function BurnHistory({ burns }: BurnHistoryProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Token ID</TableHead>
            <TableHead>Chain</TableHead>
            <TableHead>Token Address</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tx Hash</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {burns.map((burn) => (
            <TableRow key={burn.burnProof.txHash}>
              <TableCell>
                {(() => {
                  try {
                    return hexToNumber(burn.tokenId as `0x${string}`).toString()
                  } catch (error) {
                    console.error("Error converting tokenId", error)
                    return burn.tokenId
                  }
                })()}
              </TableCell>
              <TableCell className="capitalize">{burn.chain}</TableCell>
              <TableCell>{burn.collectionContractAddress}</TableCell>
              <TableCell>
                {format(new Date(burn.timestamp), "MMM d, yyyy HH:mm")}
              </TableCell>
              <TableCell className="capitalize">{burn.status}</TableCell>
              <TableCell className="font-mono">
                <a 
                  href={`https://${burn.chain === 'ethereum' ? '' : burn.chain + '.'}etherscan.io/tx/${burn.burnProof.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 truncate block max-w-[120px]"
                >
                  {burn.burnProof.txHash.slice(0, 10)}...
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}