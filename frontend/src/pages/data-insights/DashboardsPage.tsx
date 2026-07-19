import { Card, CardContent } from '../../components/ui/Card.tsx'

export function DashboardsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">仪表板中心</h2>
      <Card className="h-[600px]">
        <CardContent className="h-full p-0">
          <iframe src="/api/bi/" className="h-full w-full rounded-xl border-0" title="DataEase Dashboards" />
        </CardContent>
      </Card>
    </div>
  )
}
