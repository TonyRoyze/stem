import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Paper } from "@/lib/paper-builder"



function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp)
}

export function PaperCard({ paper }: { paper: Paper }) {
  return (
    <Link key={paper._id} href={`/papers/${paper.routeKey}`} className="block">
      <Card className="rounded-[28px] border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_24px_60px_rgba(16,185,129,0.12)]">
        <CardHeader>
          <CardTitle className="text-xl text-slate-950">
            {paper.title}
          </CardTitle>
          <div className="text-sm text-slate-500">
            {paper.subtitle || "No subtitle"}
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4 pb-5">
          <div className="space-y-1 text-sm text-slate-600">
            <div>Duration: {paper.duration || "Not set"}</div>
            <div>Updated: {formatDate(paper.updatedAt)}</div>
          </div>
          <div className="absolute right-5 bottom-0 text-sm font-medium text-emerald-700">
            Open Paper
          </div>
        </CardContent>
      </Card>
    </Link>)

}