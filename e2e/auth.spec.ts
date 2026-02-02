import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1').first()).toContainText('Login');
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h1').first()).toContainText('Register');
  });

  test('should have login form fields', async ({ page }) => {
    await page.goto('/login');
    
    // Check for username field
    await expect(page.locator('input[name="username"]')).toBeVisible();
    
    // Check for password field
    await expect(page.locator('input[name="password"]')).toBeVisible();
    
    // Check for submit button
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should have register form fields', async ({ page }) => {
    await page.goto('/register');
    
    // Check for all required fields
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="first_name"]')).toBeVisible();
    await expect(page.locator('input[name="last_name"]')).toBeVisible();
    
    // Check for submit button
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should reject invalid login', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in login form with invalid credentials
    await page.fill('input[name="username"]', 'invaliduser');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for error message - wait for it to appear
    const errorDiv = page.locator('#error');
    await expect(errorDiv).toBeVisible();
    await expect(errorDiv).toContainText(/error|invalid|failed/i);
  });
});
