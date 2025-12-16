"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { useClassesStore } from "@/lib/stores"
import { useLocalStorageState } from "@/hooks/use-local-storage-state"
import { parseReportsTabFromSearchParams } from "@/lib/reports-url-query"
import { PageHeader } from "@/components/common/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DailyReportPanel } from "@/components/reports/daily-report-panel"
import { DetailsReportPanel } from "@/components/reports/details-report-panel"
import { SummaryReportPanel } from "@/components/reports/summary-report-panel"
import { AbnormalReportPanel } from "@/components/reports/abnormal-report-panel"
import { LeaveReportPanel } from "@/components/reports/leave-report-panel"

export default function ReportsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const classes = useClassesStore((s) => s.classes)
  const loadingClasses = useClassesStore((s) => s.loadingClasses)
  const classesError = useClassesStore((s) => s.error)
  const fetchClasses = useClassesStore((s) => s.fetchClasses)

  const [tab, setTab] = useLocalStorageState<
    "daily" | "details" | "summary" | "abnormal" | "leave"
  >("reports.activeTab", "daily")

  const didInitRef = React.useRef(false)

  const normalizedSearch = React.useCallback((sp: { entries: () => IterableIterator<[string, string]> }) => {
    const entries = Array.from(sp.entries()).sort(([a], [b]) => a.localeCompare(b))
    const p = new URLSearchParams()
    for (const [k, v] of entries) p.append(k, v)
    return p.toString()
  }, [])

  React.useEffect(() => {
    if (didInitRef.current) return
    didInitRef.current = true

    const urlTab = parseReportsTabFromSearchParams(searchParams)
    if (urlTab) setTab(urlTab)
  }, [searchParams, setTab])

  React.useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.set("tab", tab)

    const next = `${pathname}?${nextParams.toString()}`
    const urlNorm = normalizedSearch(searchParams)
    const nextNorm = normalizedSearch(nextParams)
    if (urlNorm === nextNorm) return

    router.replace(next)
  }, [normalizedSearch, pathname, router, searchParams, tab])

  React.useEffect(() => {
    void fetchClasses()
  }, [fetchClasses])

  React.useEffect(() => {
    if (classesError) {
      toast.error(classesError, {
        action: {
          label: "重试",
          onClick: () => void fetchClasses(),
        },
      })
    }
  }, [classesError, fetchClasses])

  const classOptions = React.useMemo(
    () => classes.map((c) => ({ value: c.name, label: `${c.name}（${c.student_count}）` })),
    [classes]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="统计报表"
        description="按日期与班级生成日报、明细、汇总、异常与请假报表。"
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="space-y-4">
        <TabsList className="w-full justify-start overflow-auto whitespace-nowrap">
          <TabsTrigger value="daily">日报</TabsTrigger>
          <TabsTrigger value="details">明细</TabsTrigger>
          <TabsTrigger value="summary">汇总</TabsTrigger>
          <TabsTrigger value="abnormal">异常</TabsTrigger>
          <TabsTrigger value="leave">请假</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <DailyReportPanel classOptions={classOptions} loadingClasses={loadingClasses} />
        </TabsContent>

        <TabsContent value="details">
          <DetailsReportPanel classOptions={classOptions} loadingClasses={loadingClasses} />
        </TabsContent>

        <TabsContent value="summary">
          <SummaryReportPanel classOptions={classOptions} loadingClasses={loadingClasses} />
        </TabsContent>

        <TabsContent value="abnormal">
          <AbnormalReportPanel classOptions={classOptions} loadingClasses={loadingClasses} />
        </TabsContent>

        <TabsContent value="leave">
          <LeaveReportPanel classOptions={classOptions} loadingClasses={loadingClasses} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
