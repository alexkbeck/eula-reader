const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Side Panel Tests', () => {
  test.beforeEach(async ({ context }) => {
    // Load the extension
    const extensionPath = path.join(__dirname, '..');
    await context.route('**/*', route => route.continue());
  });

  test('should open side panel when extension icon is clicked', async ({ page }) => {
    // Navigate to a terms page
    await page.goto(`file://${path.join(__dirname, 'test/terms-of-service.html')}`);
    
    // Click the extension icon (this will need to be adapted based on your extension's UI)
    await page.click('.termwise-button');
    
    // Check if side panel is visible
    const sidePanel = await page.evaluate(() => {
      return !!document.querySelector('.termwise-sidepanel');
    });
    
    expect(sidePanel).toBeTruthy();
  });

  test('should display loading state while analyzing', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, 'test/terms-of-service.html')}`);
    await page.click('.termwise-button');
    
    // Check for loading indicator
    const hasLoadingState = await page.evaluate(() => {
      return !!document.querySelector('.termwise-loading');
    });
    
    expect(hasLoadingState).toBeTruthy();
  });

  test('should display summary after analysis', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, 'test/terms-of-service.html')}`);
    await page.click('.termwise-button');
    
    // Wait for analysis to complete (adjust timeout as needed)
    await page.waitForSelector('.termwise-summary', { timeout: 10000 });
    
    // Check if summary content is present
    const summaryText = await page.evaluate(() => {
      return document.querySelector('.termwise-summary').textContent;
    });
    
    expect(summaryText).toBeTruthy();
    expect(summaryText.length).toBeGreaterThan(100); // Assuming summary should be substantial
  });

  test('should handle user questions', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, 'test/terms-of-service.html')}`);
    await page.click('.termwise-button');
    
    // Wait for analysis to complete
    await page.waitForSelector('.termwise-summary');
    
    // Type and submit a question
    await page.fill('.termwise-question-input', 'What are my privacy rights?');
    await page.click('.termwise-submit-question');
    
    // Wait for response
    await page.waitForSelector('.termwise-answer');
    
    const answer = await page.evaluate(() => {
      return document.querySelector('.termwise-answer').textContent;
    });
    
    expect(answer).toBeTruthy();
    expect(answer.length).toBeGreaterThan(50); // Assuming answer should be substantial
  });

  test('should enforce guard rails on user input', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, 'test/terms-of-service.html')}`);
    await page.click('.termwise-button');
    await page.waitForSelector('.termwise-summary');
    
    // Try submitting a blocked question
    await page.fill('.termwise-question-input', 'How can I hack this website?');
    await page.click('.termwise-submit-question');
    
    // Check for error message
    const errorMessage = await page.evaluate(() => {
      return document.querySelector('.termwise-error').textContent;
    });
    
    expect(errorMessage).toContain('designed specifically to help with EULA');
  });
}); 