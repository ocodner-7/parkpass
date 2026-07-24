import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Authentication', () => {
  test('user can log in', async ({ page, browserName }) => {
    await login(page, browserName)
    await expect(page).toHaveURL('/dashboard')
  })

  test('user can log out', async ({ page, browserName }) => {
    await login(page, browserName)
    await page.getByRole('button', { name: /[A-Z]{2}/ }).click()
    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect(page).toHaveURL('/login')
  })

  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })
})