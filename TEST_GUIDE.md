# TermWise Test Guide

This guide provides detailed instructions for running and analyzing the TermWise test suite.

## Table of Contents
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Analyzing Test Results](#analyzing-test-results)
- [Debugging Failed Tests](#debugging-failed-tests)
- [Continuous Improvement](#continuous-improvement)

## Setup

1. Install Node.js dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install chromium
```

## Running Tests

You have several options for running the tests:

### Option 1: Run All Tests
```bash
npm test
```
This will run all test files in the `tests/` directory.

### Option 2: Run Specific Test Files
```bash
npm test tests/document-detection.spec.js
npm test tests/sidepanel.spec.js
npm test tests/options.spec.js
npm test tests/error-handling.spec.js
```

### Option 3: Run Tests in Debug Mode
```bash
npm run test:debug
```
This will run tests with the debugger enabled, showing browser actions in real-time.

### Option 4: Run Tests in UI Mode
```bash
npm run test:ui
```
This opens an interactive UI where you can:
- Select which tests to run
- Watch test execution in real-time
- Review test results visually
- Re-run failed tests

## Analyzing Test Results

### HTML Report
After running tests, Playwright generates an HTML report at `playwright-report/index.html`:

1. Open the report in your browser:
```bash
npx playwright show-report
```

2. The report shows:
   - Overall test summary
   - Test execution time
   - Pass/fail status for each test
   - Error messages and stack traces
   - Screenshots of failures
   - Test steps and actions

### Understanding Test Output

The console output will show:

```
Running 24 tests using 1 worker

  ✓ document-detection.spec.js:8:1 › should not detect regular blog post as terms (2s)
  ✓ document-detection.spec.js:22:1 › should detect terms of service page (1.5s)
  ✗ error-handling.spec.js:15:1 › should handle network failure gracefully
    Error: expected error message to contain "network"
```

Key symbols:
- ✓ (green checkmark): Test passed
- ✗ (red X): Test failed
- ⠋ (spinning): Test in progress
- ! (yellow): Test skipped

### Analyzing Failures

When a test fails, you'll see:
1. The file and line number where the failure occurred
2. The expected vs actual results
3. A stack trace
4. Screenshots of the failure state (in the HTML report)

Example failure analysis:
```
Error: expect(errorMessage).toContain('network')

Expected: "network"
Received: "Unable to connect. Please check your internet connection."

  at line 42:
    expect(errorMessage).toContain('network');
```

### Test Coverage Analysis

To analyze which parts of your code are being tested:

1. Add coverage reporting to `playwright.config.js`:
```javascript
use: {
  ...
  coverage: {
    enabled: true,
    reporter: ['html', 'text']
  }
}
```

2. Run tests with coverage:
```bash
npm test -- --coverage
```

3. View the coverage report in `coverage/index.html`

## Debugging Failed Tests

1. Run specific failed tests:
```bash
npm test -- --grep "network failure"
```

2. Use UI mode for visual debugging:
```bash
npm run test:ui
```
Then:
- Click on failed tests
- Step through test actions
- View console logs
- Inspect network requests

3. Add debug logs in tests:
```javascript
test('should handle network failure', async ({ page }, testInfo) => {
  console.log('Test started:', testInfo.title);
  // ... test code ...
});
```

## Continuous Improvement

After analyzing results:
1. Review failed tests to identify patterns
2. Update tests based on new edge cases discovered
3. Add new test cases for uncovered scenarios
4. Monitor test execution times for performance issues

Remember:
- Green tests don't always mean bug-free code
- Failed tests are opportunities for improvement
- Regular test maintenance keeps the suite reliable
- Consider adding more edge cases as they're discovered

## Test Categories

The test suite includes several categories of tests:

### Document Detection Tests
- Tests for correctly identifying Terms/EULA pages
- Tests for avoiding false positives
- Rate limit estimation tests

### Side Panel Tests
- UI visibility and interaction tests
- Loading states
- Summary generation
- Question handling
- Guard rail enforcement

### Options Page Tests
- Settings persistence
- API key validation
- Model selection
- Default settings restoration

### Error Handling Tests
- Network failures
- API rate limiting
- Invalid responses
- Server errors
- Timeout handling
- Authentication errors
- Malformed HTML
- Concurrency issues

## Best Practices

1. **Test Organization**
   - Keep tests focused and atomic
   - Use descriptive test names
   - Group related tests together
   - Maintain test independence

2. **Test Data**
   - Use consistent test fixtures
   - Clean up test data after each test
   - Avoid hardcoding sensitive data
   - Use environment variables for configuration

3. **Test Maintenance**
   - Review and update tests regularly
   - Remove obsolete tests
   - Add tests for new features
   - Keep test code clean and readable

4. **Performance**
   - Monitor test execution time
   - Optimize slow tests
   - Use appropriate timeouts
   - Consider parallel test execution

## Troubleshooting

Common issues and solutions:

1. **Tests failing intermittently**
   - Check for race conditions
   - Increase timeouts
   - Add retry logic
   - Review network conditions

2. **Browser launch issues**
   - Verify Playwright installation
   - Check system requirements
   - Clear browser cache
   - Update Playwright

3. **Network-related failures**
   - Check internet connection
   - Verify API endpoints
   - Review rate limits
   - Check proxy settings

4. **UI test failures**
   - Verify element selectors
   - Check for dynamic content
   - Review CSS changes
   - Consider viewport settings 