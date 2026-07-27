import { expect, test } from "@playwright/test";

test("landing page offers a clear sign-in entry point", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("heading", { name: "A simple, safer way in." })).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
});

test("create flow keeps an exact address out of the public preview route", async ({ page }) => {
  const fakeAddress = "12 Example Street, London E8 1AA";
  const requestedUrls: string[] = [];
  const consoleMessages: string[] = [];
  page.on("request", (request) => requestedUrls.push(request.url()));
  page.on("console", (message) => consoleMessages.push(message.text()));

  await page.goto("/");
  await page.getByRole("link", { name: "Plan a housewarming" }).click();
  await expect(page.getByRole("heading", { name: "Start with a good welcome." })).toBeVisible();
  await page.getByLabel("Exact address approved guests only").fill(fakeAddress);
  await expect(page.getByText("never included in the invitation preview")).toBeVisible();
  await page.goto("/preview?title=New%20keys&area=Hackney");
  await expect(page.getByRole("heading", { name: "This is what guests see before approval." })).toBeVisible();
  await expect(page.getByText("Exact address locked")).toBeVisible();
  await expect(page.getByText(fakeAddress)).not.toBeVisible();
  expect(page.url()).not.toContain(encodeURIComponent(fakeAddress));
  expect(await page.content()).not.toContain(fakeAddress);
  expect(
    await page.locator("meta").evaluateAll((nodes) => nodes.map((node) => node.outerHTML).join("\n"))
  ).not.toContain(fakeAddress);
  expect(
    await page.evaluate(() => `${JSON.stringify(localStorage)}${JSON.stringify(sessionStorage)}`)
  ).not.toContain(fakeAddress);
  expect(requestedUrls.join("\n")).not.toContain(fakeAddress);
  expect(consoleMessages.join("\n")).not.toContain(fakeAddress);
});
