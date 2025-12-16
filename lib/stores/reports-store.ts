import { create } from "zustand"

import { reportsApi } from "@/lib/api"
import type {
  AbnormalReport,
  AttendanceDetailsReport,
  DailyReport,
  LeaveReport,
  SummaryReport,
} from "@/lib/types"

type ReportsState = {
  details: AttendanceDetailsReport | null
  daily: DailyReport | null
  summary: SummaryReport | null
  abnormal: AbnormalReport | null
  leave: LeaveReport | null
  loading: boolean
  error: string | null

  fetchDetails: (params: {
    start_date: string
    end_date: string
    class?: string
    student_id?: string
  }) => Promise<void>
  fetchDaily: (params: { date: string; class?: string }) => Promise<void>
  fetchSummary: (params: { start_date: string; end_date: string; class?: string }) => Promise<void>
  fetchAbnormal: (params: {
    start_date: string
    end_date: string
    class?: string
    type?: "absent" | "late" | "early_leave"
  }) => Promise<void>
  fetchLeave: (params: {
    start_date: string
    end_date: string
    class?: string
    type?: "personal_leave" | "sick_leave"
  }) => Promise<void>
  clearError: () => void
}

export const useReportsStore = create<ReportsState>((set) => ({
  details: null,
  daily: null,
  summary: null,
  abnormal: null,
  leave: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchDetails: async (params) => {
    set({ loading: true, error: null })
    try {
      const res = await reportsApi.details(params)
      set({ details: res.data, loading: false })
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : "获取考勤明细失败" })
    }
  },

  fetchDaily: async (params) => {
    set({ loading: true, error: null })
    try {
      const res = await reportsApi.daily(params)
      set({ daily: res.data, loading: false })
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : "获取日报表失败" })
    }
  },

  fetchSummary: async (params) => {
    set({ loading: true, error: null })
    try {
      const res = await reportsApi.summary(params)
      set({ summary: res.data, loading: false })
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : "获取汇总表失败" })
    }
  },

  fetchAbnormal: async (params) => {
    set({ loading: true, error: null })
    try {
      const res = await reportsApi.abnormal(params)
      set({ abnormal: res.data, loading: false })
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : "获取异常表失败" })
    }
  },

  fetchLeave: async (params) => {
    set({ loading: true, error: null })
    try {
      const res = await reportsApi.leave(params)
      set({ leave: res.data, loading: false })
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : "获取请假汇总失败" })
    }
  },
}))
