const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Error Handling Tests', () => {
  test.beforeEach(async ({ context }) => {
    // Load the extension
    const extensionPath = path.join(__dirname, '..');
    await context.route('**/*', route => route.continue());
  });

  test('should handle network failure gracefully', async ({ page, context }) => {
    // Simulate offline mode
    await context.route('https://openrouter.ai/api/**', route => route.abort('failed'));
    
    await page.goto(`file://${path.join(__dirname, 'test/terms-of-service.html')}`);
    await page.click('.termwise-button');
    
    // Wait for error message
    await page.waitForSelector('.termwise-error');
    const errorMessage = await page.evaluate(() => {
      return document.querySelector('.termwise-error').textContent;
    });
    
    expect(errorMessage).toContain('network');
    expect(errorMessage).toContain('connection');

    // Verify UI is still responsive
    const canInteract = await page.evaluate(() => {
      return !document.querySelector('.termwise-button').disabled &&
             !document.querySelector('.termwise-question-input').disabled;
    });
    expect(canInteract).toBeTruthy();
  });

  test('should handle API rate limiting', async ({ page, context }) => {
    // Simulate rate limit response
    await context.route('https://openrouter.ai/api/**', route => {
      return route.fulfill({
        status: 429,
        body: JSON.stringify({
          error: 'Rate limit exceeded',
          retry_after: 60
        })
      });
    });
    
    await page.goto(`file://${path.join(__dirname, 'test/terms-of-service.html')}`);
    await page.click('.termwise-button');
    
    // Check for rate limit message
    await page.waitForSelector('.termwise-error');
    const errorMessage = await page.evaluate(() => {
      return document.querySelector('.termwise-error').textContent;
    });
    
    expect(errorMessage).toContain('rate limit');
    expect(errorMessage).toContain('try again');

    // Verify retry information is shown
    const hasRetryInfo = await page.evaluate(() => {
      return document.querySelector('.termwise-retry-info').textContent;
    });
    expect(hasRetryInfo).toContain('60');
  });

  test('should handle invalid API responses', async ({ page, context }) => {
    // Simulate malformed API response
    await context.route('https://openrouter.ai/api/**', route => {
      return route.fulfill({
        status: 200,
        body: 'Invalid JSON response'
      });
    });
    
    await page.goto(`file://${path.join(__dirname, 'test/terms-of-service.html')}`);
    await page.click('.termwise-button');
    
    // Check for error message
    await page.waitForSelector('.termwise-error');
    const errorMessage = await page.evaluate(() => {
      return document.querySelector('.termwise-error').textContent;
    });
    
    expect(errorMessage).toContain('response');
    expect(errorMessage).toContain('invalid');
  });

  test('should handle API server errors', async ({ page, context }) => {
    // Simulate 500 Internal Server Error
    await context.route('https://openrouter.ai/api/**', route => {
      return route.fulfill({
        status: 500,
        body: JSON.stringify({
          error: 'Internal Server Error'
        })
      });
    });
    
    await page.goto(`file://${path.join(__dirname, 'test/terms-of-service.html')}`);
    await page.click('.termwise-button');
    
    // Check for error message
    await page.waitForSelector('.termwise-error');
    const errorMessage = await page.evaluate(() => {
      return document.querySelector('.termwise-error').textContent;
    });
    
    expect(errorMessage).toContain('server');
    expect(errorMessage).toContain('try again later');
  });

  test('should handle timeout errors', async ({ page, context }) => {
    // Simulate slow response that exceeds timeout
    await context.route('https://openrouter.ai/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 31000)); // Exceeds 30s timeout
      return route.fulfill({
        status: 200,
        body: JSON.stringify({ result: 'Too late' })
      });
    });
    
    await page.goto(`file://${path.join(__dirname, 'test/terms-of-service.html')}`);
    await page.click('.termwise-button');
    
    // Check for timeout message
    await page.waitForSelector('.termwise-error');
    const errorMessage = await page.evaluate(() => {
      return document.querySelector('.termwise-error').textContent;
    });
    
    expect(errorMessage).toContain('timeout');
    expect(errorMessage).toContain('took too long');
  });

  test('should handle invalid authentication', async ({ page, context }) => {
    // Simulate invalid API key response
    await context.route('https://openrouter.ai/api/**', route => {
      return route.fulfill({
        status: 401,
        body: JSON.stringify({
          error: 'Invalid API key'
        })
      });
    });
    
    await page.goto(`file://${path.join(__dirname, 'test/terms-of-service.html')}`);
    await page.click('.termwise-button');
    
    // Check for auth error message
    await page.waitForSelector('.termwise-error');
    const errorMessage = await page.evaluate(() => {
      return document.querySelector('.termwise-error').textContent;
    });
    
    expect(errorMessage).toContain('API key');
    expect(errorMessage).toContain('invalid');

    // Verify link to options page is shown
    const hasOptionsLink = await page.evaluate(() => {
      return !!document.querySelector('a[href*="options.html"]');
    });
    expect(hasOptionsLink).toBeTruthy();
  });

  test('should handle malformed HTML content', async ({ page }) => {
    // Create a page with malformed HTML
    await page.setContent(`
      <html>
        <body>
          <div>Terms of Service
          <p>This is a malformed HTML document
          <span>Missing closing tags
          <strong>Nested incorrectly
          </div>
    `);
    
    await page.click('.termwise-button');
    
    // Verify the extension still works
    const hasExtensionUI = await page.evaluate(() => {
      return !!document.querySelector('.termwise-overlay') || 
             !!document.querySelector('.termwise-button');
    });
    
    expect(hasExtensionUI).toBeTruthy();
    
    // Check if content was extracted despite malformed HTML
    const hasContent = await page.evaluate(() => {
      return document.querySelector('.termwise-summary').textContent.length > 0;
    });
    
    expect(hasContent).toBeTruthy();
  });

  test('should handle concurrent API requests', async ({ page, context }) => {
    let requestCount = 0;
    
    // Track concurrent requests
    await context.route('https://openrouter.ai/api/**', async route => {
      requestCount++;
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ result: 'Success' })
      });
    });
    
    // Trigger multiple actions that would cause API requests
    await page.goto(`file://${path.join(__dirname, 'test/terms-of-service.html')}`);
    await Promise.all([
      page.click('.termwise-button'),
      page.fill('.termwise-question-input', 'What are my rights?'),
      page.click('.termwise-submit-question'),
      page.fill('.termwise-question-input', 'Another question?'),
      page.click('.termwise-submit-question')
    ]);
    
    // Verify only one request is in flight at a time
    expect(requestCount).toBeLessThanOrEqual(1);
    
    // Check for any race condition errors
    const hasError = await page.evaluate(() => {
      return !!document.querySelector('.termwise-error');
    });
    
    expect(hasError).toBeFalsy();
  });
}); 