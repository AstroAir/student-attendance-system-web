import type {
  AbnormalReport,
  ApiResponse,
  Attendance,
  AttendanceBatchCreate,
  AttendanceCreate,
  AttendanceDetailsReport,
  AttendanceListResponse,
  AttendanceStatus,
  AttendanceUpdate,
  ClassInfo,
  ClassStudentsResponse,
  DailyReport,
  ImportResult,
  LeaveReport,
  Student,
  StudentCreate,
  StudentListResponse,
  StudentUpdate,
  SummaryReport,
} from "@/lib/types"

const DEFAULT_BASE_URL = "http://localhost:8080/api/v1"

export type ExportType = "students" | "attendances" | "all"
export type ExportFormat = "json" | "csv"

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE_URL
}

function buildQuery(
  params:
    | Record<
        string,
        string | number | boolean | undefined | null | Array<string | number>
      >
    | undefined
) {
  if (!params) return ""

  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue

    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, String(item))
      }
      continue
    }

    searchParams.set(key, String(value))
  }

  const query = searchParams.toString()
  return query ? `?${query}` : ""
}

async function requestJson<T>(
  path: string,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers || {}),
    },
  })

  if (res.status === 204) {
    return {
      code: 204,
      message: "success",
      data: undefined as unknown as T,
    }
  }

  const contentType = res.headers.get("content-type") || ""
  const isJson = contentType.includes("application/json")

  if (!res.ok) {
    if (isJson) {
      const err = (await res.json()) as { message?: string }
      throw new Error(err.message || `Request failed (${res.status})`)
    }

    const text = await res.text().catch(() => "")
    throw new Error(text || `Request failed (${res.status})`)
  }

  if (!isJson) {
    throw new Error("Unexpected response format")
  }

  return (await res.json()) as ApiResponse<T>
}

async function requestNoContent(path: string, init?: RequestInit) {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
    },
  })

  if (res.status === 204) return

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || ""
    const isJson = contentType.includes("application/json")

    if (isJson) {
      const err = (await res.json()) as { message?: string }
      throw new Error(err.message || `Request failed (${res.status})`)
    }

    const text = await res.text().catch(() => "")
    throw new Error(text || `Request failed (${res.status})`)
  }
}

export const studentsApi = {
  async list(params?: {
    page?: number
    page_size?: number
    sort_by?: "student_id" | "name" | "class"
    order?: "asc" | "desc"
    class?: string
    keyword?: string
  }) {
    return requestJson<StudentListResponse>(`/students${buildQuery(params)}`)
  },

  async create(payload: StudentCreate) {
    return requestJson<Student>("/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  },

  async get(studentId: string) {
    return requestJson<Student>(`/students/${encodeURIComponent(studentId)}`)
  },

  async update(studentId: string, payload: StudentUpdate) {
    return requestJson<Student>(`/students/${encodeURIComponent(studentId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  },

  async remove(studentId: string) {
    await requestNoContent(`/students/${encodeURIComponent(studentId)}`, {
      method: "DELETE",
    })
  },
}

export const attendancesApi = {
  async list(params?: {
    page?: number
    page_size?: number
    student_id?: string
    name?: string
    class?: string
    date?: string
    start_date?: string
    end_date?: string
    status?: AttendanceStatus
    sort_by?: "student_id" | "name" | "date"
    order?: "asc" | "desc"
  }) {
    return requestJson<AttendanceListResponse>(
      `/attendances${buildQuery(params)}`
    )
  },

  async create(payload: AttendanceCreate) {
    return requestJson<Attendance>("/attendances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  },

  async batchCreate(payload: AttendanceBatchCreate) {
    return requestJson<{ created_count: number }>("/attendances/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  },

  async get(id: number) {
    return requestJson<Attendance>(`/attendances/${id}`)
  },

  async update(id: number, payload: AttendanceUpdate) {
    return requestJson<Attendance>(`/attendances/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  },

  async remove(id: number) {
    await requestNoContent(`/attendances/${id}`, { method: "DELETE" })
  },
}

export const reportsApi = {
  async details(params: {
    start_date: string
    end_date: string
    class?: string
    student_id?: string
  }) {
    return requestJson<AttendanceDetailsReport>(
      `/reports/details${buildQuery(params)}`
    )
  },

  async daily(params: { date: string; class?: string }) {
    return requestJson<DailyReport>(`/reports/daily${buildQuery(params)}`)
  },

  async summary(params: { start_date: string; end_date: string; class?: string }) {
    return requestJson<SummaryReport>(`/reports/summary${buildQuery(params)}`)
  },

  async abnormal(params: {
    start_date: string
    end_date: string
    class?: string
    type?: "absent" | "late" | "early_leave"
  }) {
    return requestJson<AbnormalReport>(`/reports/abnormal${buildQuery(params)}`)
  },

  async leave(params: {
    start_date: string
    end_date: string
    class?: string
    type?: "personal_leave" | "sick_leave"
  }) {
    return requestJson<LeaveReport>(`/reports/leave${buildQuery(params)}`)
  },
}

export const dataApi = {
  async exportData(params: { type: ExportType; format?: ExportFormat }) {
    const res = await fetch(`${getBaseUrl()}/data/export${buildQuery(params)}`, {
      headers: {
        Accept: params.format === "csv" ? "text/csv" : "application/json",
      },
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error(text || `Request failed (${res.status})`)
    }

    const contentType = res.headers.get("content-type") || ""
    if (contentType.includes("text/csv")) {
      return { format: "csv" as const, content: await res.text() }
    }

    return { format: "json" as const, content: await res.json() }
  },

  async importData(payload: { type: "students" | "attendances"; file: File }) {
    const form = new FormData()
    form.set("type", payload.type)
    form.set("file", payload.file)

    return requestJson<ImportResult>("/data/import", {
      method: "POST",
      body: form,
    })
  },
}

export const classesApi = {
  async list() {
    return requestJson<ClassInfo[]>("/classes")
  },

  async students(className: string) {
    return requestJson<ClassStudentsResponse>(
      `/classes/${encodeURIComponent(className)}/students`
    )
  },
}
