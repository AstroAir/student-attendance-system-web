import { create } from "zustand"

import { dataApi } from "@/lib/api"
import type { ImportResult } from "@/lib/types"

type DataState = {
  exporting: boolean
  importing: boolean
  importResult: ImportResult | null
  error: string | null

  exportData: (params: {
    type: "students" | "attendances" | "all"
    format?: "json" | "csv"
  }) => Promise<{ format: "json" | "csv"; content: unknown }>
  importData: (params: { type: "students" | "attendances"; file: File }) => Promise<void>
  clear: () => void
  clearError: () => void
}

export const useDataStore = create<DataState>((set) => ({
  exporting: false,
  importing: false,
  importResult: null,
  error: null,

  clear: () => set({ importResult: null, error: null }),
  clearError: () => set({ error: null }),

  exportData: async (params) => {
    set({ exporting: true, error: null })
    try {
      const res = await dataApi.exportData(params)
      set({ exporting: false })
      return res
    } catch (e) {
      set({ exporting: false, error: e instanceof Error ? e.message : "导出失败" })
      throw e
    }
  },

  importData: async (params) => {
    set({ importing: true, error: null, importResult: null })
    try {
      const res = await dataApi.importData(params)
      set({ importing: false, importResult: res.data })
    } catch (e) {
      set({ importing: false, error: e instanceof Error ? e.message : "导入失败" })
      throw e
    }
  },
}))
