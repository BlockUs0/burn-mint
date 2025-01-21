import { BurnHistory } from "@/components/BurnHistory/BurnHistory"
import { useBurns } from "@/hooks/useBurns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BurnHistoryPage() {
  // Get burns with default limit of 10
  const { burns } = useBurns({ limit: 10 })

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Burn History</CardTitle>
        </CardHeader>
        <CardContent>
          <BurnHistory burns={burns?.items || []} />
        </CardContent>
      </Card>
    </div>
  )
}