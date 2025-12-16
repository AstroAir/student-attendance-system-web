import { test, expect } from "@playwright/test"

test.describe("Classes Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/classes")
    // Wait for data to load
    await page.waitForSelector("table", { timeout: 10000 })
  })

  test("should display classes list", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "班级管理" })).toBeVisible()
    // Check for card titles
    await expect(page.locator("text=班级列表").first()).toBeVisible()
    await expect(page.locator("text=班级学生").first()).toBeVisible()
    
    // Check that classes are loaded - wait for loading to complete
    await page.waitForTimeout(1000)
    const rows = page.locator("table").first().locator("tbody tr")
    await expect(rows.first()).toBeVisible({ timeout: 10000 })
  })

  test("should select a class and show students", async ({ page }) => {
    const targetClassName = "人文2401班"

    // Click on a known class row to avoid skeleton rows
    const classRow = page
      .locator("table")
      .first()
      .locator("tbody tr")
      .filter({ hasText: targetClassName })
      .first()

    await expect(classRow).toBeVisible({ timeout: 15000 })
    await classRow.click()
    
    // Wait for students to load
    await page.waitForTimeout(500)
    
    // Check that students table shows data
    const studentsTable = page.locator("table").nth(1)
    await expect(studentsTable.getByRole("columnheader", { name: "学号" })).toBeVisible()
    await expect(studentsTable.getByRole("columnheader", { name: "姓名" })).toBeVisible()
  })

  test("should show class name after selection", async ({ page }) => {
    const targetClassName = "人文2401班"

    const classRow = page
      .locator("table")
      .first()
      .locator("tbody tr")
      .filter({ hasText: targetClassName })
      .first()

    await expect(classRow).toBeVisible({ timeout: 15000 })
    await classRow.click()
    await page.waitForTimeout(1000)

    const currentClass = page.locator("text=当前班级：")
    await expect(currentClass.first()).toBeVisible({ timeout: 15000 })
    await expect(currentClass.first()).toContainText(targetClassName, { timeout: 15000 })
  })

  test("should refresh data", async ({ page }) => {
    await page.getByRole("button", { name: /刷新/ }).click()
    
    // Wait for refresh to complete
    await page.waitForTimeout(1000)
    
    // Data should still be visible
    const rows = page.locator("table").first().locator("tbody tr")
    await expect(rows.first()).toBeVisible()
  })

  test("should highlight selected class row", async ({ page }) => {
    const targetClassName = "人文2401班"

    const classRow = page
      .locator("table")
      .first()
      .locator("tbody tr")
      .filter({ hasText: targetClassName })
      .first()

    await expect(classRow).toBeVisible({ timeout: 15000 })
    await classRow.click()
    
    // Check that row has selected styling
    await expect(classRow).toHaveClass(/bg-accent/)
  })

  test("should persist selected class on page refresh", async ({ page }) => {
    const targetClassName = "人文2401班"

    const classRow = page
      .locator("table")
      .first()
      .locator("tbody tr")
      .filter({ hasText: targetClassName })
      .first()

    await expect(classRow).toBeVisible({ timeout: 15000 })
    await classRow.click()
    
    // Wait for selection to be saved to localStorage
    await page.waitForTimeout(2000)
    
    // Verify selection was made before refresh
    const currentBefore = page.locator("text=当前班级：")
    await expect(currentBefore.first()).toBeVisible({ timeout: 15000 })
    await expect(currentBefore.first()).toContainText(targetClassName, { timeout: 15000 })
    
    // Refresh page
    await page.reload()
    await page.waitForSelector("table", { timeout: 15000 })

    // Wait for data to load and localStorage to be restored
    await expect(page.getByText("加载中...")).toBeHidden({ timeout: 15000 })
    await page.waitForTimeout(2000)

    // Ensure localStorage kept the selection (helps diagnose flaky restore)
    const saved = await page.evaluate(() => {
      const raw = localStorage.getItem("classes.selectedClass")
      if (raw == null) return null
      try {
        return JSON.parse(raw) as string
      } catch {
        return raw
      }
    })
    expect(saved).toBe(targetClassName)

    // Check that class is still selected (text may render in different nodes)
    const currentClass = page.locator("text=当前班级：")
    await expect(currentClass.first()).toBeVisible({ timeout: 15000 })
    await expect(currentClass.first()).toContainText(targetClassName)
  })

  test("should show empty state message when no class selected", async ({ page }) => {
    // Clear localStorage to ensure no class is selected
    await page.evaluate(() => localStorage.removeItem("classes.selectedClass"))
    await page.reload()
    await page.waitForSelector("table", { timeout: 10000 })
    await page.waitForTimeout(1000)
    
    // Use first() to avoid strict mode violation
    await expect(page.getByText("请选择左侧班级")).toBeVisible({ timeout: 5000 })
  })
})
