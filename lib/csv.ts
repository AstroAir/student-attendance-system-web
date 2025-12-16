type CsvValue = string | number | boolean | null | undefined

function escapeCsvCell(value: CsvValue) {
  if (value === null || value === undefined) return ""
  const text = String(value)
  if (text.includes("\"") || text.includes(",") || text.includes("\n") || text.includes("\r")) {
    return `"${text.replaceAll("\"", '""')}"`
  }
  return text
}

export function toCsv(params: {
  headers: string[]
  rows: CsvValue[][]
}) {
  const lines: string[] = []
  lines.push(params.headers.map(escapeCsvCell).join(","))
  for (const row of params.rows) {
    lines.push(row.map(escapeCsvCell).join(","))
  }
  return lines.join("\r\n")
}
