import { create } from "zustand"

import { attendancesApi } from "@/lib/api"
import type {
  Attendance,
  AttendanceBatchCreate,
  AttendanceCreate,
  AttendanceListResponse,
  AttendanceStatus,
  AttendanceUpdate,
} from "@/lib/types"

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

type AttendancesState = {
  query: AttendancesQuery
  list: AttendanceListResponse | null
  selected: Attendance | null
  loadingList: boolean
  loadingSelected: boolean
  saving: boolean
  error: string | null

  setQuery: (patch: Partial<AttendancesQuery>) => void
  fetchList: (patch?: Partial<AttendancesQuery>) => Promise<void>
  fetchOne: (id: number) => Promise<void>
  createOne: (payload: AttendanceCreate) => Promise<Attendance>
  batchCreate: (payload: AttendanceBatchCreate) => Promise<{ created_count: number }>
  updateOne: (id: number, payload: AttendanceUpdate) => Promise<Attendance>
  removeOne: (id: number) => Promise<void>
  clearError: () => void
}

export const useAttendancesStore = create<AttendancesState>((set, get) => ({
  query: {
    page: 1,
    page_size: 20,
    order: "asc",
  },
  list: null,
  selected: null,
  loadingList: false,
  loadingSelected: false,
  saving: false,
  error: null,

  setQuery: (patch) => set((s) => ({ query: { ...s.query, ...patch } })),

  clearError: () => set({ error: null }),

  fetchList: async (patch) => {
    const nextQuery = { ...get().query, ...(patch || {}) }
    set({ loadingList: true, error: null, query: nextQuery })

    try {
      const res = await attendancesApi.list(nextQuery)
      set({ list: res.data, loadingList: false })
    } catch (e) {
      set({ loadingList: false, error: e instanceof Error ? e.message : "加载考勤列表失败" })
    }
  },

  fetchOne: async (id) => {
    set({ loadingSelected: true, error: null })
    try {
      const res = await attendancesApi.get(id)
      set({ selected: res.data, loadingSelected: false })
    } catch (e) {
      set({ loadingSelected: false, error: e instanceof Error ? e.message : "加载考勤记录失败" })
    }
  },

  createOne: async (payload) => {
    set({ saving: true, error: null })
    try {
      const res = await attendancesApi.create(payload)
      set({ saving: false })
      await get().fetchList({ page: 1 })
      return res.data
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : "创建考勤记录失败" })
      throw e
    }
  },

  batchCreate: async (payload) => {
    set({ saving: true, error: null })
    try {
      const res = await attendancesApi.batchCreate(payload)
      set({ saving: false })
      await get().fetchList({ page: 1, date: payload.date })
      return res.data
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : "批量创建失败" })
      throw e
    }
  },

  updateOne: async (id, payload) => {
    set({ saving: true, error: null })
    try {
      const res = await attendancesApi.update(id, payload)
      set({ saving: false, selected: res.data })
      await get().fetchList()
      return res.data
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : "更新考勤记录失败" })
      throw e
    }
  },

  removeOne: async (id) => {
    set({ saving: true, error: null })
    try {
      await attendancesApi.remove(id)
      set({ saving: false })
      await get().fetchList()
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : "删除考勤记录失败" })
      throw e
    }
  },
}))
