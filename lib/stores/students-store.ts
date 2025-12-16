import { create } from "zustand"

import { studentsApi } from "@/lib/api"
import type { Student, StudentCreate, StudentListResponse, StudentUpdate } from "@/lib/types"

type StudentsQuery = {
  page: number
  page_size: number
  sort_by?: "student_id" | "name" | "class"
  order?: "asc" | "desc"
  class?: string
  keyword?: string
}

type StudentsState = {
  query: StudentsQuery
  list: StudentListResponse | null
  selected: Student | null
  loadingList: boolean
  loadingSelected: boolean
  saving: boolean
  error: string | null

  setQuery: (patch: Partial<StudentsQuery>) => void
  fetchList: (patch?: Partial<StudentsQuery>) => Promise<void>
  fetchOne: (studentId: string) => Promise<void>
  createOne: (payload: StudentCreate) => Promise<Student>
  updateOne: (studentId: string, payload: StudentUpdate) => Promise<Student>
  removeOne: (studentId: string) => Promise<void>
  clearError: () => void
}

export const useStudentsStore = create<StudentsState>((set, get) => ({
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
      const res = await studentsApi.list(nextQuery)
      set({ list: res.data, loadingList: false })
    } catch (e) {
      set({ loadingList: false, error: e instanceof Error ? e.message : "加载学生列表失败" })
    }
  },

  fetchOne: async (studentId) => {
    set({ loadingSelected: true, error: null })
    try {
      const res = await studentsApi.get(studentId)
      set({ selected: res.data, loadingSelected: false })
    } catch (e) {
      set({ loadingSelected: false, error: e instanceof Error ? e.message : "加载学生信息失败" })
    }
  },

  createOne: async (payload) => {
    set({ saving: true, error: null })
    try {
      const res = await studentsApi.create(payload)
      set({ saving: false })
      await get().fetchList({ page: 1 })
      return res.data
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : "创建学生失败" })
      throw e
    }
  },

  updateOne: async (studentId, payload) => {
    set({ saving: true, error: null })
    try {
      const res = await studentsApi.update(studentId, payload)
      set({ saving: false, selected: res.data })
      await get().fetchList()
      return res.data
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : "更新学生失败" })
      throw e
    }
  },

  removeOne: async (studentId) => {
    set({ saving: true, error: null })
    try {
      await studentsApi.remove(studentId)
      set({ saving: false })
      await get().fetchList()
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : "删除学生失败" })
      throw e
    }
  },
}))
