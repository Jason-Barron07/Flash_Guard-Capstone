import path from 'path';
import type { Page } from '@playwright/test';

export async function captureScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: path.resolve(__dirname, '../artifacts/test-results', `${name}-${Date.now()}.png`),
    fullPage: true,
  });
}
