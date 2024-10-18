// @ts-check
const { test, expect } = require("@playwright/test");
const path = require("path");

// test.beforeAll(async () => {
//   console.log("Test begin");
// });

test.beforeEach(async ({ page }) => {
  await page.goto("https://dev-erp.seta-international.vn/login");
  await page.getByText("Mock Login").click();

  await page.getByText("Login").click();
});

test("Create and submit goal", async ({ page }) => {
  await test.step("Create goal", async () => {
    page.waitForResponse((res) => res.url().includes("api/v2/goals"));
    await page.getByRole("button", { name: "Add" }).first().click();

    await page
      .getByPlaceholder("Write your goal name and")
      .first()
      .fill("AUTOMATION GOAL");

    await page
      .getByPlaceholder("Write your key result here")
      .first()
      .fill("KR 1");

    await page
      .getByPlaceholder("Write your key result here")
      .nth(1)
      .fill("KR 2");

    await page
      .getByPlaceholder("Write your key result here")
      .nth(2)
      .fill("KR 3");

    await Promise.all([
      page.waitForResponse((res) => res.url().includes("api/v2/goals")),
      page.getByRole("button", { name: "Add" }).nth(1).click(),
    ]);

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByText("Goal created successfully")).toBeVisible();

    await page.waitForResponse((res) => res.url().includes("api/v2/goals"));

    await expect(page.getByText("AUTOMATION GOAL")).toBeVisible();
  });

  await test.step("Delete goal", async () => {
    await page.locator(".rounded-full > .w-4").first().click();

    await Promise.all([
      page.waitForResponse((res) => res.url().includes("api/v2/goals")),
      page.getByRole("button", { name: "Delete" }).click(),
    ]);

    await expect(page.getByText("Goal deleted successfully")).toBeVisible();

    await expect(page.getByText("AUTOMATION GOAL")).not.toBeVisible();
  });
});

test("My Voice", async ({ page }) => {
  await page.getByLabel("My Voice").click();

  await page.getByRole("button", { name: "Add" }).click();

  await page
    .getByPlaceholder("Provide a title or brief")
    .fill("TEST SUGGESTION AUTOMATION");

  await page
    .getByPlaceholder("Explain the context")
    .fill("TEST RATIONALE AUTOMATION");

  await page
    .getByPlaceholder("Describe any possible")
    .fill("TEST POTENTIAL IMPACT");

  const saveButton = page.getByRole("button", { name: "Save" });
  await expect(saveButton).toBeEnabled();
  await saveButton.click();
});

test("Reviewer Assign", async ({ page }) => {
  await page.getByLabel("Reviewer Assignment").click();

  await page.waitForLoadState("networkidle");

  await page
    .getByRole("row", { name: "Mock User 0 100001 Assign" })
    .getByRole("button")
    .click();

  await page.getByPlaceholder("Search name").fill("Mock Admin");

  await Promise.all([
    page.waitForResponse((res) =>
      res.url().includes("api/v2/manager/employees")
    ),
    page.getByText("MAMock Admin Mock Admin100000").click(),
  ]);

  await expect(page.getByText("Reviewer assigned successfully")).toBeVisible();

  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("button", { name: "Mock Admin" })).toBeVisible();

  await page.getByRole("button", { name: "Mock Admin" }).locator("svg").click();

  await expect(page.getByText("Reviewer removed")).toBeVisible();
});

test("Employee Reviews", async ({ page }) => {
  await page.getByLabel("Employee Reviews").click();
  await page.waitForLoadState("networkidle");

  await page.getByRole("cell", { name: "Mock User 0" }).click();

  await page.waitForLoadState("networkidle");

  await expect(page.getByText("Company & Project Goals")).toBeVisible();

  await page.getByRole("tab", { name: "Manager Comments" }).click();

  await expect(page.getByRole("button", { name: "Add" })).toHaveCount(2);
  await page.getByRole("button", { name: "Add" }).first().click();

  await page.getByPlaceholder("Write text here...").fill("AUTOMATION TEST");

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page
    .locator("div")
    .filter({ hasText: /^Drop files to attach, or browse$/ })
    .click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles([path.join(__dirname, "example.jpeg")]);

  await expect(page.getByText("example.jpeg")).toBeVisible();

  await Promise.all([
    page.waitForResponse((res) =>
      res.url().includes("api/v2/attachments/upload")
    ),
    page.waitForResponse((res) =>
      res.url().includes("api/v2/manager/comments")
    ),
    page.getByRole("button", { name: "Save" }).click(),
  ]);

  await expect(page.getByText("Comment submitted successfully!")).toBeVisible();
  await expect(page.getByText("AUTOMATION TEST")).toBeVisible();
  await expect(page.getByText("example.jpeg")).toBeVisible();

  await page
    .getByRole("tabpanel", { name: "Manager Comments" })
    .getByRole("button")
    .nth(2)
    .click();
  await page.getByText("Delete").click();

  await expect(page.getByText("Comment deleted")).toBeVisible();
  await expect(page.getByText("AUTOMATION TEST")).not.toBeVisible();
});

test.afterEach(async ({ page }) => {
  await page.getByRole("button", { name: "MA" }).click();
  await page.getByRole("button", { name: "Sign Out" }).click();

  await expect(page.getByText("Login with Zoho")).toBeVisible();
});
