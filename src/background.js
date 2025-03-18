// Background service worker for TermWise

// Global variables to store EULA content and URL for the sidepanel
let pendingEulaContent = null;
let pendingEulaUrl = null;
let shouldProcessEula = false;

// Guard rails for LLM - add these functions to the top of the file
function isValidEulaRequest(content) {
  // Check if content is provided and is a string
  if (!content || typeof content !== 'string') {
    return false;
  }
  
  // Check if content is long enough to be a EULA (at least 500 characters)
  if (content.length < 500) {
    return false;
  }
  
  // Check if content appears to be a legal document by looking for common legal terms
  const legalTerms = [
    'terms', 'conditions', 'agreement', 'rights', 'obligations', 
    'privacy', 'policy', 'consent', 'license', 'warranty', 
    'liability', 'disclaimer', 'termination', 'copyright'
  ];
  
  const legalTermCount = legalTerms.filter(term => 
    content.toLowerCase().includes(term.toLowerCase())
  ).length;
  
  // If the content contains at least 4 legal terms, it's likely a legal document
  return legalTermCount >= 4;
}

function sanitizeContent(content) {
  // Truncate to a reasonable size if needed (15,000 characters max)
  if (content.length > 15000) {
    content = content.substring(0, 15000);
  }
  
  // Optional: Remove or replace potentially harmful content
  // This is a basic example - you might want to add more sophisticated filtering
  const sensitivePatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Remove script tags
    /javascript:/gi,  // Remove javascript: URLs
    /on\w+="[^"]*"/gi // Remove event handlers
  ];
  
  sensitivePatterns.forEach(pattern => {
    content = content.replace(pattern, '');
  });
  
  return content;
}

// Function to get the pending EULA data and reset it
function getPendingEulaData() {
  const data = {
    content: pendingEulaContent,
    url: pendingEulaUrl,
    shouldProcess: shouldProcessEula
  };
  
  // Reset the data
  pendingEulaContent = null;
  pendingEulaUrl = null;
  shouldProcessEula = false;
  
  return data;
}

// Open side panel when extension icon is clicked (this is a user gesture)
chrome.action.onClicked.addListener((tab) => {
  // This is in response to a user gesture (clicking the extension icon)
  chrome.sidePanel.open({ tabId: tab.id });
  
  // Tell content script to analyze the page for EULA/T&C content
  chrome.tabs.sendMessage(tab.id, { action: "analyze_page" });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background script received message:", message.action);
  
  if (message.action === 'extract_and_analyze_eula') {
    console.log("Request to extract and analyze EULA from:", sender.tab.url);
    
    // Check if this is a valid EULA request
    if (!isValidEulaRequest(message.eulaContent)) {
      console.log("Invalid EULA content - does not appear to be a legal document");
      sendResponse({ 
        success: false, 
        error: "The content doesn't appear to be a valid legal document or Terms of Service."
      });
      return true;
    }
    
    // Sanitize the content
    const sanitizedContent = sanitizeContent(message.eulaContent);
    
    // Store the sanitized EULA content and URL for the side panel
    pendingEulaContent = sanitizedContent;
    pendingEulaUrl = sender.tab.url;
    shouldProcessEula = true;
    
    // Open the side panel
    if (chrome.sidePanel && chrome.sidePanel.open) {
      chrome.sidePanel.open({ tabId: sender.tab.id }).then(() => {
        console.log("Side panel opened successfully");
      }).catch((error) => {
        console.error("Error opening side panel:", error);
      });
    } else {
      console.log("Side panel API not available, falling back to extension page");
      chrome.windows.create({
        url: chrome.runtime.getURL("sidepanel.html"),
        type: "popup",
        width: 400,
        height: 600
      });
    }
    
    sendResponse({ success: true });
  } else if (message.action === 'get_pending_eula_data') {
    console.log("Request for pending EULA data");
    sendResponse(getPendingEulaData());
    
    // Reset the flag so it doesn't get processed again
    if (shouldProcessEula) {
      shouldProcessEula = false;
    }
  }
  
  return true; // Keep message channel open for async response
}); 