# TermWise Permissions Justification

This document explains why TermWise requires each permission listed in the manifest.json file.

## Permissions Used

### `activeTab`
**Justification:** TermWise needs to access the content of the current tab to analyze legal documents like Terms of Service and Privacy Policies. This permission is only used when the user explicitly activates the extension by clicking its icon.

### `scripting`
**Justification:** This permission is required to inject content scripts that detect legal documents and provide the overlay asking if the user wants to analyze the document. The scripting permission is essential for the core functionality of identifying and processing text on web pages.

### `sidePanel`
**Justification:** TermWise uses Chrome's side panel API to display summaries, analysis, and the chat interface where users can ask follow-up questions about legal documents. This provides a clean, non-intrusive UI that doesn't interfere with the page content.

### `storage`
**Justification:** This permission is used to store user preferences and settings, such as API keys and model selection. This allows users to customize their experience and ensures settings persist between browser sessions.

## Host Permissions

### `<all_urls>`
**Justification:** TermWise needs to work on any website where a user might encounter legal documents like Terms of Service, Privacy Policies, or EULAs. The extension only activates when the user explicitly triggers it, and only accesses the content of the current page when activated.

## Content Security Policy

The extension's Content Security Policy restricts connections to:
- `self` (the extension itself)
- `https://openrouter.ai` (for API calls to OpenRouter)
- `https://*.openai.com` (for API calls to OpenAI if the user selects OpenAI models)

These connections are necessary to process legal documents using AI models and return useful summaries to users. 