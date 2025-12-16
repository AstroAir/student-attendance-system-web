export type ReportsTab = "daily" | "details" | "summary" | "abnormal" | "leave"

type SearchParamsLike = {
  get: (key: string) => string | null
}

function nonEmpty(v: string | null) {
  if (!v) return undefined
  const t = v.trim()
  return t ? t : undefined
}

export function parseReportsTabFromSearchParams(sp: SearchParamsLike): ReportsTab | undefined {
  const v = sp.get("tab")
  if (v === "daily" || v === "details" || v === "summary" || v === "abnormal" || v === "leave") {
    return v
  }
  return undefined
}

export function buildReportsTabQuery(tab: ReportsTab) {
  const p = new URLSearchParams()
  p.set("tab", tab)
  return p
}

export function parseSummaryParams(sp: SearchParamsLike) {
  return {
    start_date: nonEmpty(sp.get("summary_start_date")),
    end_date: nonEmpty(sp.get("summary_end_date")),
    class: nonEmpty(sp.get("summary_class")),
  }
}

export function buildSummaryParams(params: { start_date: string; end_date: string; class?: string }) {
  const p = new URLSearchParams()
  p.set("summary_start_date", params.start_date)
  p.set("summary_end_date", params.end_date)
  if (params.class) p.set("summary_class", params.class)
  return p
}

export function parseDetailsParams(sp: SearchParamsLike) {
  return {
    start_date: nonEmpty(sp.get("details_start_date")),
    end_date: nonEmpty(sp.get("details_end_date")),
    class: nonEmpty(sp.get("details_class")),
    student_id: nonEmpty(sp.get("details_student_id")),
  }
}

export function buildDetailsParams(params: {
  start_date: string
  end_date: string
  class?: string
  student_id?: string
}) {
  const p = new URLSearchParams()
  p.set("details_start_date", params.start_date)
  p.set("details_end_date", params.end_date)
  if (params.class) p.set("details_class", params.class)
  if (params.student_id) p.set("details_student_id", params.student_id)
  return p
}
