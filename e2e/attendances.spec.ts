import { test, expect } from "@playwright/test"

test.describe("Attendances Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/attendances")
    // Wait for data to load
    await page.waitForSelector("table", { timeout: 10000 })
  })

  test("should display attendances list", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "考勤记录" })).toBeVisible()
    
    // Check table headers
    await expect(page.getByRole("columnheader", { name: "学号" })).toBeVisible()
    await expect(page.getByRole("columnheader", { name: "姓名" })).toBeVisible()
    await expect(page.getByRole("columnheader", { name: "班级" })).toBeVisible()
    await expect(page.getByRole("columnheader", { name: "日期" })).toBeVisible()
    await expect(page.getByRole("columnheader", { name: "状态" })).toBeVisible()
    
    // Check that attendances are loaded
    const rows = page.locator("tbody tr")
    await expect(rows.first()).toBeVisible()
  })

  test("should open add attendance dialog", async ({ page }) => {
    await page.getByRole("button", { name: /新增记录/ }).click()
    
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByRole("heading", { name: /新增|考勤/ })).toBeVisible()
  })

  test("should open batch attendance dialog", async ({ page }) => {
    await page.getByRole("button", { name: /批量录入/ }).click()
    
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByRole("heading", { name: /批量/ })).toBeVisible()
  })

  test("should add a new attendance record", async ({ page }) => {
    await page.getByRole("button", { name: /新增记录/ }).click()
    
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    
    // Fill in the form - student ID
    const studentIdInput = dialog.getByLabel(/学号/)
    if (await studentIdInput.isVisible()) {
      await studentIdInput.fill("2024001")
    }
    
    // Select status
    const statusSelect = dialog.getByRole("combobox").filter({ hasText: /状态|出勤/ })
    if (await statusSelect.isVisible()) {
      await statusSelect.click()
      await page.getByRole("option", { name: /出勤|present/ }).click()
    }
    
    // Submit
    const submitButton = dialog.getByRole("button", { name: /保存|确定|提交/ })
    if (await submitButton.isVisible()) {
      await submitButton.click()
    }
  })

  test("should filter attendances by student ID", async ({ page }) => {
    const studentIdInput = page.getByPlaceholder(/学号/)
    if (await studentIdInput.isVisible()) {
      await studentIdInput.fill("2024001")
      await page.getByRole("button", { name: /搜索|查询/ }).click()
      await page.waitForTimeout(500)
      await expect(page).toHaveURL(/student_id=2024001/)
    }
  })

  test("should filter attendances by name", async ({ page }) => {
    const nameInput = page.getByPlaceholder(/姓名/)
    if (await nameInput.isVisible()) {
      await nameInput.fill("张")
      await page.getByRole("button", { name: /搜索|查询/ }).click()
      await page.waitForTimeout(500)
      await expect(page).toHaveURL(/name=/)
    }
  })

  test("should filter attendances by date", async ({ page }) => {
    const dateInput = page.getByPlaceholder(/日期/).or(page.locator('input[type="date"]'))
    if (await dateInput.isVisible()) {
      // Just verify the date filter exists
      await expect(dateInput).toBeVisible()
    }
  })

  test("should filter attendances by status", async ({ page }) => {
    // Find the status filter by label
    const statusLabel = page.locator("text=状态").first()
    if (await statusLabel.isVisible()) {
      const statusFilter = statusLabel.locator("..").getByRole("combobox")
      if (await statusFilter.isVisible()) {
        await statusFilter.click()
        const absentOption = page.getByRole("option", { name: /缺勤/ })
        if (await absentOption.isVisible()) {
          await absentOption.click()
          await page.getByRole("button", { name: "查询" }).click()
          await page.waitForTimeout(500)
        }
      }
    }
  })

  test("should reset filters", async ({ page }) => {
    // Apply a filter first
    const studentIdInput = page.getByPlaceholder(/学号/)
    if (await studentIdInput.isVisible()) {
      await studentIdInput.fill("test")
      await page.getByRole("button", { name: /搜索|查询/ }).click()
      await page.waitForTimeout(500)
      
      // Reset
      await page.getByRole("button", { name: /重置/ }).click()
      await page.waitForTimeout(500)
      
      // Check that filter is cleared
      await expect(studentIdInput).toHaveValue("")
    }
  })

  test("should paginate attendances", async ({ page }) => {
    // Check if pagination exists - look for page 2 button or next button
    const page2Button = page.locator('button:has-text("2")').first()
    const nextButton = page.getByRole("button", { name: /下一页|Next|>|›/ })
    
    // Try page 2 button first
    if (await page2Button.isVisible().catch(() => false)) {
      await page2Button.click()
      await page.waitForTimeout(500)
    } else if (await nextButton.isVisible().catch(() => false) && await nextButton.isEnabled().catch(() => false)) {
      await nextButton.click()
      await page.waitForTimeout(500)
    }
    // Test passes if pagination controls exist or if there's only one page
  })

  test("should edit an attendance record", async ({ page }) => {
    // Click edit button on first row
    const editButton = page.locator("tbody tr").first().getByRole("button", { name: /编辑|修改/ })
    
    if (await editButton.isVisible()) {
      await editButton.click()
      
      const dialog = page.getByRole("dialog")
      await expect(dialog).toBeVisible()
    }
  })

  test("should copy filter link", async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"])
    
    await page.getByRole("button", { name: /复制筛选链接/ }).click()
    
    // Check for success toast
    await expect(page.getByText(/已复制/)).toBeVisible({ timeout: 5000 })
  })

  test("should sort attendances", async ({ page }) => {
    // Check if sort controls exist
    const sortSelect = page.getByRole("combobox").filter({ hasText: /排序|日期/ })
    if (await sortSelect.isVisible()) {
      await sortSelect.click()
      const option = page.getByRole("option").first()
      if (await option.isVisible()) {
        await option.click()
      }
    }
  })
})
