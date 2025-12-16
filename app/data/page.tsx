"use client"

import * as React from "react"
import { DownloadIcon, UploadIcon } from "lucide-react"
import { toast } from "sonner"

import { useDataStore } from "@/lib/stores"
import { useLocalStorageState } from "@/hooks/use-local-storage-state"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

type ExportType = "students" | "attendances" | "all"
type ExportFormat = "json" | "csv"

type ImportType = "students" | "attendances"

function downloadText(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
}

export default function DataPage() {
  const exporting = useDataStore((s) => s.exporting)
  const importing = useDataStore((s) => s.importing)
  const importResult = useDataStore((s) => s.importResult)
  const error = useDataStore((s) => s.error)
  const exportData = useDataStore((s) => s.exportData)
  const importData = useDataStore((s) => s.importData)
  const clear = useDataStore((s) => s.clear)

  React.useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const [exportType, setExportType] = useLocalStorageState<ExportType>(
    "data.exportType",
    "all"
  )
  const [exportFormat, setExportFormat] = useLocalStorageState<ExportFormat>(
    "data.exportFormat",
    "json"
  )
  const [exportPreview, setExportPreview] = React.useState<string>("")

  const [importType, setImportType] = useLocalStorageState<ImportType>(
    "data.importType",
    "students"
  )
  const [file, setFile] = React.useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const maxImportBytes = 10 * 1024 * 1024

  function setSelectedFile(next: File | null) {
    if (!next) {
      setFile(null)
      return
    }

    const name = next.name.toLowerCase()
    const okExt = name.endsWith(".json") || name.endsWith(".csv")
    if (!okExt) {
      toast.error("仅支持 .json 或 .csv 文件")
      if (fileInputRef.current) fileInputRef.current.value = ""
      setFile(null)
      return
    }

    if (next.size > maxImportBytes) {
      toast.error("文件过大，请选择小于 10MB 的文件")
      if (fileInputRef.current) fileInputRef.current.value = ""
      setFile(null)
      return
    }

    setFile(next)
  }

  async function handleExport() {
    try {
      const res = await exportData({ type: exportType, format: exportFormat })

      if (res.format === "csv") {
        const content = String(res.content)
        setExportPreview(content)
        downloadText(
          `export-${exportType}.${exportFormat}`,
          content,
          "text/csv;charset=utf-8"
        )
        toast.success("已导出 CSV 并开始下载")
        return
      }

      const jsonText = JSON.stringify(res.content, null, 2)
      setExportPreview(jsonText)
      downloadText(
        `export-${exportType}.${exportFormat}`,
        jsonText,
        "application/json;charset=utf-8"
      )
      toast.success("已导出 JSON 并开始下载")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "导出失败")
    }
  }

  async function handleImport() {
    if (!file) {
      toast.error("请选择文件")
      return
    }

    try {
      await importData({ type: importType, file })
      toast.success("导入完成")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "导入失败")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="数据导入导出"
        description="支持学生与考勤数据的导入（上传文件）与导出（下载 JSON/CSV）。"
        actions={
          <Button
            variant="outline"
            onClick={() => {
              clear()
              setSelectedFile(null)
              if (fileInputRef.current) fileInputRef.current.value = ""
              setExportPreview("")
            }}
            disabled={exporting || importing}
          >
            清空结果
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">导出</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>导出类型</Label>
                <Select
                  value={exportType}
                  onValueChange={(v) => setExportType(v as ExportType)}
                  disabled={exporting || importing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择导出类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="students">学生</SelectItem>
                    <SelectItem value="attendances">考勤</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>导出格式</Label>
                <Select
                  value={exportFormat}
                  onValueChange={(v) => setExportFormat(v as ExportFormat)}
                  disabled={exporting || importing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择导出格式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={() => void handleExport()} disabled={exporting || importing}>
              <DownloadIcon />
              导出并下载
            </Button>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>导出预览（最近一次）</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!exportPreview}
                  onClick={() => {
                    void copyToClipboard(exportPreview)
                      .then(() => toast.success("已复制到剪贴板"))
                      .catch(() => toast.error("复制失败"))
                  }}
                >
                  复制
                </Button>
              </div>
              <ScrollArea className="h-[180px] sm:h-[260px] rounded-md border">
                <pre className="p-3 text-xs leading-relaxed">
                  {exportPreview || "暂无导出内容"}
                </pre>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">导入</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>导入类型</Label>
                <Select
                  value={importType}
                  onValueChange={(v) => setImportType(v as ImportType)}
                  disabled={exporting || importing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择导入类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="students">学生</SelectItem>
                    <SelectItem value="attendances">考勤</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>选择文件</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  disabled={exporting || importing}
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                {file ? (
                  <div className="text-sm text-muted-foreground break-all">
                    已选择：{file.name}（{Math.ceil(file.size / 1024)} KB）
                  </div>
                ) : null}
              </div>
            </div>

            <Button onClick={() => void handleImport()} disabled={exporting || importing || !file}>
              <UploadIcon />
              上传并导入
            </Button>

            {importResult ? (
              <>
                <Separator />

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">导入成功</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-semibold tabular-nums">
                      {importResult.imported_count}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">跳过</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-semibold tabular-nums">
                      {importResult.skipped_count}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">错误行</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-semibold tabular-nums">
                      {importResult.errors.length}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <Label>错误详情</Label>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[90px]">行号</TableHead>
                          <TableHead>原因</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importResult.errors.length > 0 ? (
                          importResult.errors.map((err, idx) => (
                            <TableRow key={`${err.line}-${idx}`}>
                              <TableCell className="tabular-nums">{err.line}</TableCell>
                              <TableCell className="wrap-break-word">{err.message}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              className="py-8 text-center text-sm text-muted-foreground"
                            >
                              无错误
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
