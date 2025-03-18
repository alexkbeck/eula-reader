# TermWise - Chrome Extension

A Chrome extension that helps you understand Terms & Conditions and EULAs by providing AI-powered summaries in plain English.

## Features

- Automatically detects when you're viewing a Terms & Conditions or EULA page
- Opens a side panel with an AI-generated summary of the document
- Highlights important points that affect your rights
- Allows you to ask follow-up questions about specific sections or concerns
- Provides suggested questions about fairness, rights, and detailed explanations
- Uses Google's Gemini 2.0 Flash Lite model via OpenRouter by default

## Installation

1. Download or clone this repository to your local machine
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top right corner
4. Click "Load unpacked" and select the directory containing the extension files
5. The TermWise extension should now be visible in your Chrome toolbar

## Configuration

The extension comes pre-configured with an OpenRouter API key and the Gemini 2.0 Flash Lite model. However, you can customize these settings:

1. Click on the extension icon in the Chrome toolbar and select "Options"
2. You can:
   - Enter your own OpenRouter API key (get one at [OpenRouter.ai](https://openrouter.ai))
   - Change the model (options include Gemini 2.0 Flash Lite, GPT-4 Turbo, or GPT-3.5 Turbo)
   - Modify the API endpoint if needed
3. Click "Save Settings" to apply your changes

### Default Configuration

- **API Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
- **Model**: `google/gemini-2.0-flash-lite-preview-02-05:free`
- **API Key**: A pre-configured OpenRouter API key (you may want to replace this with your own)

## Usage

1. Visit a website with Terms & Conditions or a EULA
2. Click the TermWise icon in your browser toolbar
3. The side panel will open and begin analyzing the document
4. Once analysis is complete, you'll see a summary highlighting important points
5. Use the suggested follow-up questions or ask your own questions in the chat interface

## How It Works

The extension uses a combination of heuristics to detect when you're viewing a Terms & Conditions or EULA document. It extracts the text content from the page and sends it to the configured LLM API with specific instructions to:

1. Summarize the document in conversational English
2. Highlight terms that notably affect your rights
3. Focus on unusual terms or potential "gotchas"
4. Present the information as if an attorney were advising you in your best interest

### About Gemini 2.0 Flash Lite

The extension uses Google's Gemini 2.0 Flash Lite model via OpenRouter by default. This model provides:

- Fast and efficient processing of legal documents
- High-quality summaries of complex legal language
- Accurate identification of important clauses and potential issues
- Responsive answers to follow-up questions

## Privacy

- The extension only processes document text when you explicitly activate it
- Document text is sent to the LLM API for processing and is not stored permanently
- Your conversations with the AI are not saved between browser sessions
- When using OpenRouter, their privacy policy applies to data processing

## Development

This extension is built using:
- Manifest V3 for Chrome Extensions
- Vanilla JavaScript, HTML, and CSS
- Material Design principles for the UI
- OpenRouter API for accessing various LLM models

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This extension was built to help users make more informed decisions when agreeing to online terms and conditions
- It is not a substitute for professional legal advice
- Thanks to OpenRouter for providing access to the Gemini 2.0 Flash Lite model 