import type { AttendanceStatus } from "@/lib/types"

type SearchParamsLike = {
  get: (key: string) => string | null
}

type StudentsQuery = {
  page: number
  page_size: number
  sort_by?: "student_id" | "name" | "class"
  order?: "asc" | "desc"
  class?: string
  keyword?: string
}

type AttendancesQuery = {
  page: number
  page_size: number
  student_id?: string
  name?: string
  class?: string
  date?: string
  start_date?: string
  end_date?: string
  status?: AttendanceStatus
  sort_by?: "student_id" | "name" | "date"
  order?: "asc" | "desc"
}

function parsePositiveInt(v: string | null) {
  if (!v) return undefined
  const n = Number.parseInt(v, 10)
  if (!Number.isFinite(n) || n <= 0) return undefined
  return n
}

function isAttendanceStatus(v: string): v is AttendanceStatus {
  return (
    v === "present" ||
    v === "absent" ||
    v === "personal_leave" ||
    v === "sick_leave" ||
    v === "late" ||
    v === "early_leave"
  )
}

export function parseStudentsQueryFromSearchParams(sp: SearchParamsLike): Partial<StudentsQuery> {
  const page = parsePositiveInt(sp.get("page"))
  const pageSize = parsePositiveInt(sp.get("page_size"))
  const sortByRaw = sp.get("sort_by")
  const orderRaw = sp.get("order")
  const classValue = sp.get("class")
  const keyword = sp.get("keyword")

  const patch: Partial<StudentsQuery> = {}

  if (page) patch.page = page
  if (pageSize) patch.page_size = pageSize

  if (sortByRaw === "student_id" || sortByRaw === "name" || sortByRaw === "class") {
    patch.sort_by = sortByRaw
  }

  if (orderRaw === "asc" || orderRaw === "desc") {
    patch.order = orderRaw
  }

  if (classValue && classValue.trim()) patch.class = classValue
  if (keyword && keyword.trim()) patch.keyword = keyword

  return patch
}

export function buildStudentsQueryString(q: StudentsQuery) {
  const params = new URLSearchParams()

  if (q.page !== 1) params.set("page", String(q.page))
  if (q.page_size !== 20) params.set("page_size", String(q.page_size))
  if (q.sort_by) params.set("sort_by", q.sort_by)
  if (q.order && q.order !== "asc") params.set("order", q.order)
  if (q.class) params.set("class", q.class)
  if (q.keyword) params.set("keyword", q.keyword)

  return params.toString()
}

export function parseAttendancesQueryFromSearchParams(sp: SearchParamsLike): Partial<AttendancesQuery> {
  const page = parsePositiveInt(sp.get("page"))
  const pageSize = parsePositiveInt(sp.get("page_size"))
  const sortByRaw = sp.get("sort_by")
  const orderRaw = sp.get("order")
  const statusRaw = sp.get("status")

  const patch: Partial<AttendancesQuery> = {}

  if (page) patch.page = page
  if (pageSize) patch.page_size = pageSize

  const studentId = sp.get("student_id")
  const name = sp.get("name")
  const classValue = sp.get("class")
  const date = sp.get("date")
  const startDate = sp.get("start_date")
  const endDate = sp.get("end_date")

  if (studentId && studentId.trim()) patch.student_id = studentId
  if (name && name.trim()) patch.name = name
  if (classValue && classValue.trim()) patch.class = classValue
  if (date && date.trim()) patch.date = date
  if (startDate && startDate.trim()) patch.start_date = startDate
  if (endDate && endDate.trim()) patch.end_date = endDate

  if (statusRaw && isAttendanceStatus(statusRaw)) {
    patch.status = statusRaw
  }

  if (sortByRaw === "student_id" || sortByRaw === "name" || sortByRaw === "date") {
    patch.sort_by = sortByRaw
  }

  if (orderRaw === "asc" || orderRaw === "desc") {
    patch.order = orderRaw
  }

  return patch
}

export function buildAttendancesQueryString(q: AttendancesQuery) {
  const params = new URLSearchParams()

  if (q.page !== 1) params.set("page", String(q.page))
  if (q.page_size !== 20) params.set("page_size", String(q.page_size))
  if (q.student_id) params.set("student_id", q.student_id)
  if (q.name) params.set("name", q.name)
  if (q.class) params.set("class", q.class)
  if (q.date) params.set("date", q.date)
  if (q.start_date) params.set("start_date", q.start_date)
  if (q.end_date) params.set("end_date", q.end_date)
  if (q.status) params.set("status", q.status)
  if (q.sort_by) params.set("sort_by", q.sort_by)
  if (q.order && q.order !== "asc") params.set("order", q.order)

  return params.toString()
}
