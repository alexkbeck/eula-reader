const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Document Detection Tests', () => {
  test.beforeEach(async ({ context }) => {
    // Load the extension
    const extensionPath = path.join(__dirname, '..');
    await context.route('**/*', route => route.continue());
  });

  test('should not detect regular blog post as terms', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, 'fixtures/not-terms.html')}`);
    
    // Wait for content script to initialize
    await page.waitForTimeout(1000);
    
    // Check if the extension's UI elements are not injected
    const hasExtensionUI = await page.evaluate(() => {
      return !!document.querySelector('.termwise-overlay') || 
             !!document.querySelector('.termwise-button');
    });
    
    expect(hasExtensionUI).toBeFalsy();
  });

  test('should detect terms of service page', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, 'test/terms-of-service.html')}`);
    
    // Wait for content script to initialize
    await page.waitForTimeout(1000);
    
    // Check if the extension's UI elements are injected
    const hasExtensionUI = await page.evaluate(() => {
      return !!document.querySelector('.termwise-overlay') || 
             !!document.querySelector('.termwise-button');
    });
    
    expect(hasExtensionUI).toBeTruthy();
  });

  test('should detect privacy policy page', async ({ page }) => {
    await page.goto(`file://${path.join(__dirname, 'test/privacy-policy.html')}`);
    
    // Wait for content script to initialize
    await page.waitForTimeout(1000);
    
    // Check if the extension's UI elements are injected
    const hasExtensionUI = await page.evaluate(() => {
      return !!document.querySelector('.termwise-overlay') || 
             !!document.querySelector('.termwise-button');
    });
    
    expect(hasExtensionUI).toBeTruthy();
  });
});

// Rate limit estimation test
test('should estimate API rate limits', async ({ request }) => {
  const sampleText = await test.step('Get sample text', async () => {
    const response = await request.get(`file://${path.join(__dirname, 'test/terms-of-service.html')}`);
    return await response.text();
  });

  // Estimate tokens (rough estimate: 1 token ≈ 4 chars)
  const estimatedTokens = Math.ceil(sampleText.length / 4);
  
  // Gemini rate limits (example values - replace with actual limits)
  const RATE_LIMIT_TPM = 60000; // tokens per minute
  const RATE_LIMIT_RPM = 1000;  // requests per minute
  
  // Calculate theoretical max concurrent users
  const tokensPerRequest = estimatedTokens * 2; // Input + Output tokens
  const maxUsersByTokens = Math.floor(RATE_LIMIT_TPM / tokensPerRequest);
  const maxUsersByRequests = RATE_LIMIT_RPM;
  
  const maxConcurrentUsers = Math.min(maxUsersByTokens, maxUsersByRequests);
  
  console.log(`Estimated tokens per request: ${tokensPerRequest}`);
  console.log(`Maximum concurrent users: ${maxConcurrentUsers}`);
  
  // Assert that we can handle a reasonable number of users
  expect(maxConcurrentUsers).toBeGreaterThan(10);
}); 