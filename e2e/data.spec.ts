import { test, expect } from "@playwright/test"

test.describe("Data Import/Export Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/data")
  })

  test("should display data page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "数据导入导出" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "导出" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "导入" })).toBeVisible()
  })

  test("should have export type selector", async ({ page }) => {
    const exportTypeSelect = page.locator("text=导出类型").locator("..").getByRole("combobox")
    await expect(exportTypeSelect).toBeVisible()
    
    await exportTypeSelect.click()
    await expect(page.getByRole("option", { name: "全部" })).toBeVisible()
    await expect(page.getByRole("option", { name: "学生" })).toBeVisible()
    await expect(page.getByRole("option", { name: "考勤" })).toBeVisible()
  })

  test("should have export format selector", async ({ page }) => {
    const exportFormatSelect = page.locator("text=导出格式").locator("..").getByRole("combobox")
    await expect(exportFormatSelect).toBeVisible()
    
    await exportFormatSelect.click()
    await expect(page.getByRole("option", { name: "JSON" })).toBeVisible()
    await expect(page.getByRole("option", { name: "CSV" })).toBeVisible()
  })

  test("should export data as JSON", async ({ page }) => {
    // Select export type
    const exportTypeSelect = page.locator("text=导出类型").locator("..").getByRole("combobox")
    await exportTypeSelect.click()
    await page.getByRole("option", { name: "学生" }).click()
    
    // Select JSON format
    const exportFormatSelect = page.locator("text=导出格式").locator("..").getByRole("combobox")
    await exportFormatSelect.click()
    await page.getByRole("option", { name: "JSON" }).click()
    
    // Click export button
    await page.getByRole("button", { name: /导出并下载/ }).click()
    
    // Wait for export to complete and check for success toast
    await expect(page.getByText(/已导出|导出成功/)).toBeVisible({ timeout: 5000 })
    
    // Check preview area has content
    const preview = page.locator("pre")
    await expect(preview).not.toHaveText("暂无导出内容")
  })

  test("should export data as CSV", async ({ page }) => {
    // Select export type
    const exportTypeSelect = page.locator("text=导出类型").locator("..").getByRole("combobox")
    await exportTypeSelect.click()
    await page.getByRole("option", { name: "学生" }).click()
    
    // Select CSV format
    const exportFormatSelect = page.locator("text=导出格式").locator("..").getByRole("combobox")
    await exportFormatSelect.click()
    await page.getByRole("option", { name: "CSV" }).click()
    
    // Click export button
    await page.getByRole("button", { name: /导出并下载/ }).click()
    
    // Wait for export to complete
    await expect(page.getByText(/已导出|导出成功/)).toBeVisible({ timeout: 5000 })
  })

  test("should have import type selector", async ({ page }) => {
    const importTypeSelect = page.locator("text=导入类型").locator("..").getByRole("combobox")
    await expect(importTypeSelect).toBeVisible()
    
    await importTypeSelect.click()
    await expect(page.getByRole("option", { name: "学生" })).toBeVisible()
    await expect(page.getByRole("option", { name: "考勤" })).toBeVisible()
  })

  test("should have file input for import", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toBeVisible()
    await expect(fileInput).toHaveAttribute("accept", ".json,.csv")
  })

  test("should disable import button when no file selected", async ({ page }) => {
    const importButton = page.getByRole("button", { name: /上传并导入/ })
    await expect(importButton).toBeDisabled()
  })

  test("should copy export preview", async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"])
    
    // First export some data
    await page.getByRole("button", { name: /导出并下载/ }).click()
    await expect(page.getByText(/已导出/)).toBeVisible({ timeout: 5000 })
    
    // Click copy button
    const copyButton = page.getByRole("button", { name: /复制/ })
    await copyButton.click()
    
    // Check for success toast
    await expect(page.getByText(/已复制/)).toBeVisible({ timeout: 5000 })
  })

  test("should clear results", async ({ page }) => {
    // First export some data
    await page.getByRole("button", { name: /导出并下载/ }).click()
    await expect(page.getByText(/已导出/)).toBeVisible({ timeout: 5000 })
    
    // Click clear button
    await page.getByRole("button", { name: /清空结果/ }).click()
    
    // Check preview is cleared
    const preview = page.locator("pre")
    await expect(preview).toHaveText("暂无导出内容")
  })

  test("should export all data types", async ({ page }) => {
    // Select "all" export type
    const exportTypeSelect = page.locator("text=导出类型").locator("..").getByRole("combobox")
    await exportTypeSelect.click()
    await page.getByRole("option", { name: "全部" }).click()
    
    // Click export button
    await page.getByRole("button", { name: /导出并下载/ }).click()
    
    // Wait for export to complete
    await expect(page.getByText(/已导出/)).toBeVisible({ timeout: 5000 })
    
    // Check preview contains both students and attendances
    const preview = page.locator("pre")
    const previewText = await preview.textContent()
    expect(previewText).toContain("students")
    expect(previewText).toContain("attendances")
  })
})
