import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to blog page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/blog"]');
    await expect(page).toHaveURL('/blog');
    await expect(page.locator('h1').first()).toContainText('Blog');
  });

  test('should navigate to projects page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/projects"]');
    await expect(page).toHaveURL('/projects');
    await expect(page.locator('h1').first()).toContainText('My Projects');
  });

  test('should navigate to contact page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/contact"]');
    await expect(page).toHaveURL('/contact');
  });
});

test.describe('Home Page', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');
    // Check navbar for navigation links
    const navbar = page.locator('nav');
    await expect(navbar.locator('a[href="/blog"]')).toBeVisible();
    await expect(navbar.locator('a[href="/projects"]')).toBeVisible();
    await expect(navbar.locator('a[href="/contact"]')).toBeVisible();
  });
});
