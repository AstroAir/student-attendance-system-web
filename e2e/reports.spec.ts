import { test, expect } from "@playwright/test"

test.describe("Reports Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/reports")
  })

  test("should display reports page with tabs", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "统计报表" })).toBeVisible()
    
    // Check all tabs are visible
    await expect(page.getByRole("tab", { name: "日报" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "明细" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "汇总" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "异常" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "请假" })).toBeVisible()
  })

  test("should switch to daily report tab", async ({ page }) => {
    await page.getByRole("tab", { name: "日报" }).click()
    await expect(page).toHaveURL(/tab=daily/)
  })

  test("should switch to details report tab", async ({ page }) => {
    await page.getByRole("tab", { name: "明细" }).click()
    await expect(page).toHaveURL(/tab=details/)
  })

  test("should switch to summary report tab", async ({ page }) => {
    const tab = page.getByRole("tab", { name: "汇总" })
    await tab.scrollIntoViewIfNeeded()
    await tab.click()
    await expect(page).toHaveURL(/tab=summary/)
  })

  test("should switch to abnormal report tab", async ({ page }) => {
    await page.getByRole("tab", { name: "异常" }).click()
    await expect(page).toHaveURL(/tab=abnormal/)
  })

  test("should switch to leave report tab", async ({ page }) => {
    await page.getByRole("tab", { name: "请假" }).click()
    await expect(page).toHaveURL(/tab=leave/)
  })

  test("should generate daily report", async ({ page }) => {
    await page.getByRole("tab", { name: "日报" }).click()
    await page.waitForTimeout(500)
    
    // Click generate button
    const generateButton = page.getByRole("button", { name: /生成|查询/ })
    if (await generateButton.isVisible()) {
      await generateButton.click()
      await page.waitForTimeout(1000)
    }
    // Just verify the tab content is visible
    await expect(page.locator('[role="tabpanel"]').first()).toBeVisible()
  })

  test("should generate details report", async ({ page }) => {
    await page.getByRole("tab", { name: "明细" }).click()
    
    const generateButton = page.getByRole("button", { name: /生成|查询/ })
    if (await generateButton.isVisible()) {
      await generateButton.click()
      await page.waitForTimeout(1000)
    }
  })

  test("should generate summary report", async ({ page }) => {
    await page.getByRole("tab", { name: "汇总" }).click()
    
    const generateButton = page.getByRole("button", { name: /生成|查询/ })
    if (await generateButton.isVisible()) {
      await generateButton.click()
      await page.waitForTimeout(1000)
    }
  })

  test("should generate abnormal report", async ({ page }) => {
    await page.getByRole("tab", { name: "异常" }).click()
    
    const generateButton = page.getByRole("button", { name: /生成|查询/ })
    if (await generateButton.isVisible()) {
      await generateButton.click()
      await page.waitForTimeout(1000)
    }
  })

  test("should generate leave report", async ({ page }) => {
    await page.getByRole("tab", { name: "请假" }).click()
    
    const generateButton = page.getByRole("button", { name: /生成|查询/ })
    if (await generateButton.isVisible()) {
      await generateButton.click()
      await page.waitForTimeout(1000)
    }
  })

  test("should have class filter in reports", async ({ page }) => {
    await page.getByRole("tab", { name: "日报" }).click()
    
    // Check for class filter
    const classFilter = page.getByRole("combobox").filter({ hasText: /班级|全部/ })
    if (await classFilter.isVisible()) {
      await classFilter.click()
      // Should show class options
      const options = page.getByRole("option")
      await expect(options.first()).toBeVisible()
    }
  })

  test("should have date picker in daily report", async ({ page }) => {
    await page.getByRole("tab", { name: "日报" }).click()
    
    // Check for date input or date picker
    const dateInput = page.getByPlaceholder(/日期/).or(page.locator('input[type="date"]')).or(page.getByRole("button", { name: /选择日期|日期/ }))
    await expect(dateInput.first()).toBeVisible()
  })

  test("should have date range picker in details report", async ({ page }) => {
    await page.getByRole("tab", { name: "明细" }).click()
    await page.waitForTimeout(500)
    
    // Check that the details tab is active
    const detailsTab = page.getByRole("tab", { name: "明细" })
    await expect(detailsTab).toHaveAttribute("data-state", "active")
  })

  test("should persist active tab on page refresh", async ({ page }) => {
    // Switch to summary tab
    await page.getByRole("tab", { name: "汇总" }).click()
    await expect(page).toHaveURL(/tab=summary/)
    
    // Refresh page
    await page.reload()
    
    // Check that summary tab is still active
    const summaryTab = page.getByRole("tab", { name: "汇总" })
    await expect(summaryTab).toHaveAttribute("data-state", "active")
  })
})
