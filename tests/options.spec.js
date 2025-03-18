const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Options Page Tests', () => {
  test.beforeEach(async ({ context }) => {
    // Load the extension
    const extensionPath = path.join(__dirname, '..');
    await context.route('**/*', route => route.continue());
  });

  test('should load options page', async ({ page }) => {
    await page.goto('chrome-extension://[extension-id]/options.html');
    
    // Check if the options form is present
    const hasOptionsForm = await page.evaluate(() => {
      return !!document.querySelector('#options-form');
    });
    
    expect(hasOptionsForm).toBeTruthy();
  });

  test('should save API key', async ({ page }) => {
    await page.goto('chrome-extension://[extension-id]/options.html');
    
    // Fill in API key
    const testApiKey = 'test-api-key-123';
    await page.fill('#api-key-input', testApiKey);
    await page.click('#save-button');
    
    // Check if saved (this will need to be adapted based on your UI feedback)
    const savedMessage = await page.evaluate(() => {
      return document.querySelector('.save-success').textContent;
    });
    
    expect(savedMessage).toContain('saved');
    
    // Verify storage
    const storedApiKey = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.sync.get(['apiKey'], (result) => {
          resolve(result.apiKey);
        });
      });
    });
    
    expect(storedApiKey).toBe(testApiKey);
  });

  test('should change model selection', async ({ page }) => {
    await page.goto('chrome-extension://[extension-id]/options.html');
    
    // Select a different model
    await page.selectOption('#model-select', 'gpt-3.5-turbo');
    await page.click('#save-button');
    
    // Verify storage
    const storedModel = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.sync.get(['model'], (result) => {
          resolve(result.model);
        });
      });
    });
    
    expect(storedModel).toBe('gpt-3.5-turbo');
  });

  test('should validate API key format', async ({ page }) => {
    await page.goto('chrome-extension://[extension-id]/options.html');
    
    // Try invalid API key
    await page.fill('#api-key-input', 'invalid');
    await page.click('#save-button');
    
    // Check for error message
    const errorMessage = await page.evaluate(() => {
      return document.querySelector('.error-message').textContent;
    });
    
    expect(errorMessage).toBeTruthy();
  });

  test('should restore default settings', async ({ page }) => {
    await page.goto('chrome-extension://[extension-id]/options.html');
    
    // Click restore defaults button
    await page.click('#restore-defaults');
    
    // Verify default values
    const defaultModel = await page.evaluate(() => {
      return document.querySelector('#model-select').value;
    });
    
    expect(defaultModel).toBe('google/gemini-2.0-flash-lite-preview-02-05:free');
  });
}); 