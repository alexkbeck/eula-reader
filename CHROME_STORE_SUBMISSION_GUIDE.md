# Chrome Web Store Submission Guide for TermWise

This guide walks you through the process of submitting TermWise to the Chrome Web Store.

## Before You Begin

Make sure you have:

1. A Google account
2. A one-time registration fee of $5 USD for a Chrome Web Store developer account
3. The packaged extension (ZIP file created using the `package_extension.ps1` script)
4. Prepared promotional images and screenshots
5. Completed privacy policy (privacy-policy.md)
6. Verified all code is using Manifest V3
7. Tested the extension thoroughly in different scenarios

## Step 1: Register as a Developer

1. Go to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
2. Sign in with your Google account
3. Pay the one-time registration fee if you haven't already
4. Complete your developer account details:
   - Provide a valid contact email
   - Set up two-factor authentication (recommended)
   - Fill in your developer profile information

## Step 2: Package Your Extension

1. Run the included PowerShell script by right-clicking `package_extension.ps1` and selecting "Run with PowerShell"
2. This will create a ZIP file named `TermWise_[timestamp].zip`
3. Verify the ZIP contains:
   - All necessary files (HTML, JS, CSS)
   - Icons in all required sizes (16x16, 48x48, 128x128)
   - manifest.json with correct version number
   - No unnecessary files or development artifacts

## Step 3: Prepare Your Store Listing Assets

You'll need:

- **Icon**: Already included in the extension (128x128 PNG)
- **Screenshots** (required):
  - Prepare 3-5 screenshots showing:
    1. The extension icon detecting a Terms & Conditions page
    2. The side panel analyzing a document
    3. The chat interface for asking follow-up questions
  - Dimensions: 1280x800 or 640x400 pixels
  - Format: PNG or JPEG

- **Promotional images** (recommended):
  - Small tile: 440x280 pixels
    - Show the TermWise logo and a clear value proposition
    - Use the blue theme (#1976d2) from the extension
  - Large tile: 920x680 pixels
    - Show multiple features in action
    - Include sample analysis text
  - Marquee: 1400x560 pixels
    - Showcase the full workflow from detection to analysis

## Step 4: Submit Your Extension

1. Go to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
2. Click "Add new item"
3. Upload the ZIP file created in Step 2

4. Fill out the Store Listing tab:
   - Title: TermWise
   - Summary: "AI Privacy Policy Analysis & Quick Terms Summary - Understand what you're agreeing to in plain language."
   - Detailed Description:
     ```
     TermWise helps you understand Terms & Conditions and EULAs by providing AI-powered summaries in plain English.

     Key Features:
     • Automatically detects legal documents on websites
     • Provides instant, easy-to-understand summaries
     • Highlights important points affecting your rights
     • Allows follow-up questions about specific concerns
     • Uses advanced AI to explain complex legal terms
     • Works with any Terms & Conditions or EULA

     How it works:
     1. When you visit a page with Terms & Conditions, TermWise automatically detects it
     2. Click the TermWise icon to analyze the document
     3. Get a clear summary highlighting important points
     4. Ask follow-up questions about anything you don't understand

     Privacy & Security:
     • No permanent storage of analyzed documents
     • All data is processed securely
     • HTTPS encryption for all communications
     • Optional API key configuration
     ```
   - Category: Productivity
   - Language: English
   - Upload screenshots and promotional images

5. Fill out the Privacy tab:
   - Single Purpose Description: "AI Privacy Policy Analysis & Quick Terms Summary to help users understand legal documents"
   - Permissions Justification:
     - `activeTab`: "Required to read and analyze Terms & Conditions on the current page"
     - `scripting`: "Needed to detect and extract legal document content"
     - `sidePanel`: "Used to display the analysis interface"
     - `storage`: "Stores user preferences and API configuration"
     - `host_permissions`: "Required to analyze legal documents on any website"
   - Data Collection:
     - Text content from Terms & Conditions pages (user-initiated)
     - User questions and interactions with AI
     - Browser type and version
     - Extension settings
   - Privacy Policy: Upload privacy-policy.md or host it online

6. Configure the Distribution tab:
   - Visibility: Public
   - Distribution: All regions
   - Price: Free

7. Click "Submit for review"

## Step 5: Wait for Review

- Review process typically takes 2-5 business days
- Keep an eye on your registered email for questions or issues
- Monitor the Developer Dashboard for status updates

## Common Review Issues and Solutions

1. Permission Justification
   - Be explicit about why each permission is needed
   - Explain the user benefit for each permission
   - Link permissions to specific features

2. Privacy Concerns
   - Clearly document all data collection
   - Explain data handling and security measures
   - Provide detailed privacy policy

3. Content Security
   - Verify all API endpoints use HTTPS
   - Ensure secure handling of API keys
   - Document data transmission security

4. Functionality Issues
   - Test on various websites and legal documents
   - Verify error handling
   - Ensure consistent performance

## After Approval

1. Monitor Performance:
   - Track user feedback and ratings
   - Monitor error reports
   - Collect usage statistics

2. Plan Updates:
   - Maintain a development roadmap
   - Address user feedback
   - Keep dependencies updated

3. User Support:
   - Monitor and respond to reviews
   - Maintain support email (support@termwise.app)
   - Update FAQ and documentation

For detailed help, refer to the [Chrome Web Store documentation](https://developer.chrome.com/docs/webstore/). 