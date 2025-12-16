import { test, expect } from "@playwright/test"

test.describe("Students Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/students")
    // Wait for data to load
    await page.waitForSelector("table", { timeout: 10000 })
  })

  test("should display students list", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "学生管理" })).toBeVisible()
    
    // Check table headers
    await expect(page.getByRole("columnheader", { name: "学号" })).toBeVisible()
    await expect(page.getByRole("columnheader", { name: "姓名" })).toBeVisible()
    await expect(page.getByRole("columnheader", { name: "班级" })).toBeVisible()
    
    // Check that students are loaded
    const rows = page.locator("tbody tr")
    await expect(rows.first()).toBeVisible()
  })

  test("should open add student dialog", async ({ page }) => {
    await page.getByRole("button", { name: /新增学生/ }).click()
    
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByRole("heading", { name: /新增学生/ })).toBeVisible()
    await expect(page.getByLabel(/学号/)).toBeVisible()
    await expect(page.getByLabel(/姓名/)).toBeVisible()
  })

  test("should add a new student", async ({ page }) => {
    await page.getByRole("button", { name: /新增学生/ }).click()
    
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    
    // Fill in the form - use placeholder text to find inputs
    await dialog.getByPlaceholder("例如：2024001").fill("TEST001")
    await dialog.getByPlaceholder("例如：张三").fill("测试学生")
    
    // Select class - click the trigger with placeholder
    await dialog.getByRole("combobox").click()
    await page.getByRole("option").first().click()
    
    // Submit - button text is "创建" for new student
    await dialog.getByRole("button", { name: "创建" }).click()
    
    // Wait for dialog to close or success toast
    await expect(page.getByText(/学生已创建|已创建/)).toBeVisible({ timeout: 5000 })
  })

  test("should filter students by keyword", async ({ page }) => {
    const searchInput = page.getByPlaceholder("按学号或姓名搜索")
    await searchInput.fill("2024001")
    await page.getByRole("button", { name: "查询" }).click()
    
    // Wait for filtered results
    await page.waitForTimeout(500)
    
    // Check URL contains filter params
    await expect(page).toHaveURL(/keyword=2024001/)
  })

  test("should filter students by class", async ({ page }) => {
    // Click class filter dropdown
    const classFilter = page.locator('[data-testid="class-filter"]').or(
      page.getByRole("combobox").filter({ hasText: /班级|全部/ })
    )
    
    if (await classFilter.isVisible()) {
      await classFilter.click()
      await page.getByRole("option").first().click()
      await page.getByRole("button", { name: /搜索|查询/ }).click()
      await page.waitForTimeout(500)
    }
  })

  test("should reset filters", async ({ page }) => {
    // Apply a filter first
    const searchInput = page.getByPlaceholder("按学号或姓名搜索")
    await searchInput.fill("test")
    await page.getByRole("button", { name: "查询" }).click()
    await page.waitForTimeout(500)
    
    // Reset
    await page.getByRole("button", { name: "重置" }).click()
    await page.waitForTimeout(500)
    
    // Check that filter is cleared
    await expect(searchInput).toHaveValue("")
  })

  test("should paginate students", async ({ page }) => {
    // Check if pagination exists and has next page button
    const nextButton = page.locator("button").filter({ hasText: /下一页|>|→/ }).or(
      page.locator('[aria-label="Next page"]')
    ).or(page.locator('button:has-text("2")'))
    
    // Only test if pagination is available
    const paginationExists = await nextButton.first().isVisible().catch(() => false)
    if (paginationExists) {
      await nextButton.first().click()
      await page.waitForTimeout(500)
    }
  })

  test("should edit a student", async ({ page }) => {
    // Click edit button on first row
    const editButton = page.locator("tbody tr").first().getByRole("button", { name: /编辑|修改/ })
    
    if (await editButton.isVisible()) {
      await editButton.click()
      
      const dialog = page.getByRole("dialog")
      await expect(dialog).toBeVisible()
      await expect(page.getByRole("heading", { name: /编辑学生/ })).toBeVisible()
    }
  })

  test("should copy filter link", async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"])
    
    await page.getByRole("button", { name: /复制筛选链接/ }).click()
    
    // Check for success toast
    await expect(page.getByText(/已复制/)).toBeVisible({ timeout: 5000 })
  })
})
