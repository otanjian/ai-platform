import { Card, CardContent } from './Card.tsx'

export function PagePlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <Card>
        <CardContent>
          <p className="text-sm text-slate-500">{description}</p>
        </CardContent>
      </Card>
    </div>
  )
}
