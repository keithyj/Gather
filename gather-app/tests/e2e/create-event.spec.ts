import { expect, test } from "@playwright/test";

test("create flow keeps an exact address out of the public preview route", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Plan a housewarming" }).click();
  await expect(page.getByRole("heading", { name: "Start with a good welcome." })).toBeVisible();
  await page.getByLabel("Exact address approved guests only").fill("12 Example Street, London E8 1AA");
  await expect(page.getByText("never included in the invitation preview")).toBeVisible();
  await page.goto("/preview?title=New%20keys&area=Hackney");
  await expect(page.getByRole("heading", { name: "This is what guests see before approval." })).toBeVisible();
  await expect(page.getByText("Exact address locked")).toBeVisible();
  await expect(page.getByText("12 Example Street, London E8 1AA")).not.toBeVisible();
});
