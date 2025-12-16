import { create } from "zustand"

import { classesApi } from "@/lib/api"
import type { ClassInfo, ClassStudentsResponse } from "@/lib/types"

type ClassesState = {
  classes: ClassInfo[]
  selectedClass: string | null
  classStudents: ClassStudentsResponse | null
  loadingClasses: boolean
  loadingStudents: boolean
  error: string | null

  fetchClasses: () => Promise<void>
  selectClass: (className: string | null) => void
  fetchClassStudents: (className: string) => Promise<void>
  clearError: () => void
}

export const useClassesStore = create<ClassesState>((set) => ({
  classes: [],
  selectedClass: null,
  classStudents: null,
  loadingClasses: false,
  loadingStudents: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchClasses: async () => {
    set({ loadingClasses: true, error: null })
    try {
      const res = await classesApi.list()
      set({ classes: res.data, loadingClasses: false })
    } catch (e) {
      set({ loadingClasses: false, error: e instanceof Error ? e.message : "加载班级列表失败" })
    }
  },

  selectClass: (className) => set({ selectedClass: className }),

  fetchClassStudents: async (className) => {
    set({ loadingStudents: true, error: null, selectedClass: className })
    try {
      const res = await classesApi.students(className)
      set({ classStudents: res.data, loadingStudents: false })
    } catch (e) {
      set({ loadingStudents: false, error: e instanceof Error ? e.message : "加载班级学生失败" })
    }
  },
}))
