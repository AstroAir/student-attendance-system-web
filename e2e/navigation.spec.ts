import { test, expect, type Page } from "@playwright/test"

async function waitForAppReady(page: Page) {
  await expect(page.getByText("加载中...")).toBeHidden({ timeout: 15000 })
  await expect(page.getByRole("heading", { name: "仪表盘" })).toBeVisible({ timeout: 15000 })
}

test.describe("Navigation and Layout", () => {
  test("should load the dashboard page", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/学生考勤/)
    await expect(page.getByRole("heading", { name: "仪表盘" })).toBeVisible()
  })

  test("should display all navigation cards on dashboard", async ({ page }) => {
    await page.goto("/")
    
    // Check for card titles in the dashboard
    await expect(page.locator("text=学生管理").first()).toBeVisible()
    await expect(page.locator("text=考勤记录").first()).toBeVisible()
    await expect(page.locator("text=统计报表").first()).toBeVisible()
    await expect(page.locator("text=班级管理").first()).toBeVisible()
    await expect(page.locator("text=数据导入导出").first()).toBeVisible()
  })

  test("should navigate to students page from dashboard", async ({ page }) => {
    await page.goto("/")
    await waitForAppReady(page)
    const main = page.locator("main")
    const link = main.locator('a[href="/students"]').first()
    await expect(link).toBeVisible({ timeout: 15000 })
    await Promise.all([page.waitForURL(/\/students/, { timeout: 15000 }), link.click()])
    await expect(page.getByRole("heading", { name: "学生管理" })).toBeVisible()
  })

  test("should navigate to attendances page from dashboard", async ({ page }) => {
    await page.goto("/")
    await waitForAppReady(page)
    const main = page.locator("main")
    const link = main.locator('a[href="/attendances"]').first()
    await expect(link).toBeVisible({ timeout: 15000 })
    await Promise.all([page.waitForURL(/\/attendances/, { timeout: 15000 }), link.click()])
    await expect(page.getByRole("heading", { name: "考勤记录" })).toBeVisible()
  })

  test("should navigate to reports page from dashboard", async ({ page }) => {
    await page.goto("/")
    await waitForAppReady(page)
    const main = page.locator("main")
    const link = main.locator('a[href="/reports"]').first()
    await expect(link).toBeVisible({ timeout: 15000 })
    await Promise.all([page.waitForURL(/\/reports/, { timeout: 15000 }), link.click()])
    await expect(page.getByRole("heading", { name: "统计报表" })).toBeVisible()
  })

  test("should navigate to classes page from dashboard", async ({ page }) => {
    await page.goto("/")
    await waitForAppReady(page)
    const main = page.locator("main")
    const link = main.locator('a[href="/classes"]').first()
    await expect(link).toBeVisible({ timeout: 15000 })
    await Promise.all([page.waitForURL(/\/classes/, { timeout: 15000 }), link.click()])
    await expect(page.getByRole("heading", { name: "班级管理" })).toBeVisible()
  })

  test("should navigate to data page from dashboard", async ({ page }) => {
    await page.goto("/")
    await waitForAppReady(page)
    const main = page.locator("main")
    const link = main.locator('a[href="/data"]').first()
    await expect(link).toBeVisible({ timeout: 15000 })
    await Promise.all([page.waitForURL(/\/data/, { timeout: 15000 }), link.click()])
    await expect(page.getByRole("heading", { name: "数据导入导出" })).toBeVisible()
  })

  test("should have working sidebar navigation", async ({ page }) => {
    await page.goto("/")

    const sidebar = page.locator('[data-slot="sidebar"]').first()
    await expect(sidebar).toBeVisible()

    // Navigate using sidebar links - restrict to sidebar to avoid dashboard cards
    const studentsLink = sidebar.locator('a[href="/students"]').first()
    await studentsLink.scrollIntoViewIfNeeded()
    await studentsLink.click()
    await expect(page).toHaveURL(/\/students/)

    const attendancesLink = sidebar.locator('a[href="/attendances"]').first()
    await attendancesLink.scrollIntoViewIfNeeded()
    await attendancesLink.click()
    await expect(page).toHaveURL(/\/attendances/)

    const reportsLink = sidebar.locator('a[href="/reports"]').first()
    await reportsLink.scrollIntoViewIfNeeded()
    await reportsLink.click()
    await expect(page).toHaveURL(/\/reports/)

    const classesLink = sidebar.locator('a[href="/classes"]').first()
    await classesLink.scrollIntoViewIfNeeded()
    await classesLink.click()
    await expect(page).toHaveURL("/classes")

    const dataLink = sidebar.locator('a[href="/data"]').first()
    await dataLink.scrollIntoViewIfNeeded()
    await dataLink.click()
    await expect(page).toHaveURL("/data")

    const homeLink = sidebar.locator('a[href="/"]').first()
    await homeLink.scrollIntoViewIfNeeded()
    await homeLink.click()
    await expect(page).toHaveURL("/")
  })

  test("should toggle theme", async ({ page }) => {
    await page.goto("/")
    
    // Find and click theme toggle button
    const themeToggle = page.getByRole("button", { name: "切换主题" }).first()
    await expect(themeToggle).toBeVisible()
    await themeToggle.click()
    
    // Check that theme menu appears
    await expect(page.getByRole("menuitem", { name: /浅色|Light/i })).toBeVisible()
    await expect(page.getByRole("menuitem", { name: /深色|Dark/i })).toBeVisible()
    await expect(page.getByRole("menuitem", { name: /跟随系统|System/i })).toBeVisible()
  })
})
