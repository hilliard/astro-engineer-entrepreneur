import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('should display blog posts', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('h1').first()).toContainText('Blog');
    
    // Check if at least one blog post is visible
    const blogCards = page.locator('.blog-card');
    await expect(blogCards.first()).toBeVisible();
  });

  test('should navigate to blog post detail', async ({ page }) => {
    await page.goto('/blog');
    
    // Click the first "Read Article" button
    const readButton = page.locator('a.button-link').first();
    const href = await readButton.getAttribute('href');
    
    // Navigate to the post
    await page.goto(href);
    
    // Verify we're on a blog post page
    await expect(page.locator('.post')).toBeVisible();
    await expect(page.locator('.post-title')).toBeVisible();
  });

  test('should display blog post metadata', async ({ page }) => {
    await page.goto('/blog');
    
    // Get first post's href and navigate
    const readButton = page.locator('a.button-link').first();
    const href = await readButton.getAttribute('href');
    await page.goto(href);
    
    // Check for post elements
    await expect(page.locator('.post-image')).toBeVisible();
    await expect(page.locator('.post-title')).toBeVisible();
    await expect(page.locator('.post-date')).toBeVisible();
  });
});
