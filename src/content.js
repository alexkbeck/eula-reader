// Content script for EULA Reader

// Keywords that often appear in EULAs and Terms & Conditions
const EULA_KEYWORDS = [
  "terms of service",
  "terms and conditions",
  "end user license agreement",
  "eula",
  "user agreement",
  "privacy policy",
  "legal agreement",
  "terms of use",
  "license agreement",
  "acceptable use policy",
  "privacy notice",
  "privacy statement",
  "data policy",
  "service agreement",
  "legal notice",
  "legal terms",
  "user terms"
];

// More detailed legal terms that appear in the actual content of legal documents
const LEGAL_CONTENT_TERMS = [
  "hereby agrees",
  "shall not",
  "liable for",
  "warranty",
  "warranties",
  "indemnify",
  "indemnification",
  "jurisdiction",
  "disclaims all",
  "disclaims any",
  "governing law",
  "confidential information",
  "at its sole discretion",
  "third-party",
  "intellectual property",
  "limited license",
  "limitation of liability",
  "waiver",
  "severability",
  "entire agreement",
  "arbitration",
  "class action",
  "dispute resolution",
  "without prior",
  "notwithstanding",
  "privacy rights",
  "data collection",
  "personal information",
  "data processing",
  "data protection",
  "consent to",
  "we collect",
  "we use",
  "we share",
  "we retain",
  "you agree to",
  "you acknowledge",
  "by using",
  "terms apply",
  "acceptance of terms"
];

// Wait for page to fully load before analyzing
window.addEventListener('load', analyzePageContent);

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "analyze_page") {
    analyzePageContent();
    sendResponse({ status: "analyzing" });
  }
  return true;
});

// Helper function to check if an element is part of the footer or navigation
function isFooterOrNavElement(element) {
  // Check the element and its ancestors for footer/nav related tags or classes
  let current = element;
  
  while (current && current !== document.body) {
    // Check tagName
    if (current.tagName && ['FOOTER', 'NAV', 'HEADER'].includes(current.tagName.toUpperCase())) {
      return true;
    }
    
    // Check common class/id names that indicate navigation or footer
    const classAndId = (current.className || '') + ' ' + (current.id || '');
    const lowerClassAndId = classAndId.toLowerCase();
    
    if (/\b(footer|navigation|nav-|navbar|menu|header|site-nav|bottom-links)\b/.test(lowerClassAndId)) {
      return true;
    }
    
    current = current.parentElement;
  }
  
  return false;
}

// Analyze the page content for EULA/T&C
function analyzePageContent() {
  // Skip analysis if we're in an iframe
  if (window !== window.top) {
    return;
  }
  
  console.log("Starting EULA detection analysis...");
  
  // Extract the full text content first
  const fullText = extractPageContent();
  
  // Validate the content meets minimum requirements
  if (!validateEulaContent(fullText)) {
    console.log("Content validation failed - not a valid legal document");
    return;
  }
  
  // Get the page title and convert to lowercase for matching
  const pageTitle = document.title.toLowerCase();
  console.log("Page title:", pageTitle);
  
  // Strong title indicator: Title directly mentions it's a legal document
  const titleExactMatch = EULA_KEYWORDS.some(keyword => {
    // Check for exact or near-exact matches
    return pageTitle === keyword || 
           pageTitle.startsWith(keyword + ' ') || 
           pageTitle.endsWith(' ' + keyword) ||
           pageTitle.includes(' ' + keyword + ' ');
  });
  console.log("Title exact match:", titleExactMatch);
  
  // Weaker title indicator: Title contains a keyword but isn't exclusively about it
  const titleContainsEULA = !titleExactMatch && EULA_KEYWORDS.some(keyword => 
    pageTitle.includes(keyword)
  );
  console.log("Title contains EULA keyword:", titleContainsEULA);
  
  // Get headings that might indicate EULA content, but exclude ones in nav/footer
  const headings = document.querySelectorAll('h1, h2, h3');
  const headingContainsEULA = Array.from(headings)
    .filter(heading => !isFooterOrNavElement(heading)) // Exclude footer/nav headings
    .some(heading => 
      EULA_KEYWORDS.some(keyword => 
        heading.textContent.toLowerCase().includes(keyword)
      )
    );
  console.log("Heading contains EULA:", headingContainsEULA);
  
  // Check if there are long paragraphs of legal text
  const paragraphs = document.querySelectorAll('p');
  const hasLongParagraphs = Array.from(paragraphs)
    .filter(p => !isFooterOrNavElement(p)) // Exclude footer/nav paragraphs
    .some(p => 
      p.textContent.length > 100 &&
      (p.textContent.includes("agree") || 
       p.textContent.includes("terms") || 
       p.textContent.includes("rights") ||
       p.textContent.includes("obligations") ||
       p.textContent.includes("privacy") ||
       p.textContent.includes("collect") ||
       p.textContent.includes("process") ||
       p.textContent.includes("consent"))
    );
  console.log("Has long legal paragraphs:", hasLongParagraphs);
  
  // Check for specific legal language in the main content
  const mainContent = document.querySelector('main') || document.querySelector('article') || document.body;
  const mainContentText = mainContent.innerText.toLowerCase();
  
  // Count how many specific legal phrases are found in the main content
  const legalPhraseCount = LEGAL_CONTENT_TERMS.filter(phrase => 
    mainContentText.includes(phrase.toLowerCase())
  ).length;
  console.log("Legal phrase count:", legalPhraseCount);
  
  // Calculate a confidence score
  let confidenceScore = 0;
  let scoreBreakdown = [];
  
  // Strong indicators
  if (titleExactMatch) {
    confidenceScore += 50;
    scoreBreakdown.push("Title exact match: +50");
  }
  if (headingContainsEULA) {
    confidenceScore += 40;
    scoreBreakdown.push("Heading contains EULA: +40");
  }
  if (hasLongParagraphs) {
    confidenceScore += 30;
    scoreBreakdown.push("Has long paragraphs: +30");
  }
  if (legalPhraseCount >= 5) {
    confidenceScore += 40;
    scoreBreakdown.push("Many legal phrases: +40");
  }
  
  // Weaker indicators
  if (titleContainsEULA) {
    confidenceScore += 25;
    scoreBreakdown.push("Title contains EULA: +25");
  }
  if (legalPhraseCount >= 2) {
    confidenceScore += 20;
    scoreBreakdown.push("Some legal phrases: +20");
  }
  
  // Basic minimum for content length - legal docs are typically substantial
  const contentLength = mainContentText.length;
  if (contentLength < 1000) {
    confidenceScore -= 20;
    scoreBreakdown.push("Short content penalty: -20");
  }
  
  // Reduced penalties for page structure
  if (window.location.pathname.endsWith('index.html')) {
    confidenceScore -= 15;
    scoreBreakdown.push("Index page penalty: -15");
  }
  if (document.querySelectorAll('.card, .card-container').length > 2) {
    confidenceScore -= 15;
    scoreBreakdown.push("Card layout penalty: -15");
  }
  
  // Reduce navigation structure penalty
  if (document.querySelectorAll('nav, .nav, .navbar, .navigation').length > 2) {
    confidenceScore -= 10;
    scoreBreakdown.push("Navigation structure penalty: -10");
  }
  
  console.log("Score breakdown:", scoreBreakdown);
  console.log("Final confidence score:", confidenceScore);
  console.log("Detection threshold:", 50);

  // Only proceed if we're confident this is a legal document
  if (confidenceScore >= 50) {
    console.log("EULA or T&C detected on page");
    
    // Store the validated content for later use
    window._validatedEulaContent = fullText;
    
    // Create and show the overlay
    createOverlay();
  } else {
    console.log("Page is not a EULA/T&C document");
  }
}

// Extract EULA content from the page
function extractPageContent() {
  // Get the main content of the page
  // First try to find the main content area, including common legal document containers
  let mainContent = document.querySelector('main, article, .container, [role="main"]');
  
  // If no main content area, use the body but try to exclude navigation and footer
  if (!mainContent) {
    mainContent = document.body;
  }
  
  // Clone the content to avoid modifying the original page
  const contentCopy = mainContent.cloneNode(true);
  
  // Try to remove footer and navigation elements for better content extraction
  const elementsToRemove = contentCopy.querySelectorAll(
    'footer, nav, header, .footer, .nav, .navbar, .navigation, .menu, .header, ' +
    'script, style, noscript, iframe, .cookie-banner, .cookie-notice, .ad, ' +
    '.advertisement, .social-links, .share-buttons'
  );
  
  elementsToRemove.forEach(element => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });
  
  // Get all text content, preserving important structure
  let content = '';
  
  // Add title if it exists and seems relevant
  const title = document.title;
  if (title && EULA_KEYWORDS.some(keyword => title.toLowerCase().includes(keyword.toLowerCase()))) {
    content += title + '\n\n';
  }
  
  // Add headings and their content in a structured way
  const headings = contentCopy.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach(heading => {
    content += heading.textContent.trim() + '\n';
    let nextElement = heading.nextElementSibling;
    while (nextElement && !nextElement.matches('h1, h2, h3, h4, h5, h6')) {
      if (nextElement.textContent.trim()) {
        content += nextElement.textContent.trim() + '\n';
      }
      nextElement = nextElement.nextElementSibling;
    }
    content += '\n';
  });
  
  // If no structured content was found, fall back to all text content
  if (content.trim().length < 100) {
    content = contentCopy.innerText;
  }
  
  // Apply content filtering
  const filteredContent = filterContentForEulaAnalysis(content);
  
  return filteredContent;
}

// Filter content to ensure it's appropriate for EULA analysis
function filterContentForEulaAnalysis(content) {
  // Check if content is too short to be a meaningful EULA
  if (content.length < 500) {
    return content;
  }
  
  // Remove any script content that might have been included in the text
  let filtered = content.replace(/\<script\>.*?\<\/script\>/gis, '');
  
  // Remove email addresses and phone numbers for privacy
  filtered = filtered.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]');
  filtered = filtered.replace(/(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, '[PHONE]');
  
  // Remove URLs but keep the text
  filtered = filtered.replace(/https?:\/\/[^\s<]+/g, '[URL]');
  
  // Remove multiple consecutive newlines and spaces
  filtered = filtered.replace(/\n\s*\n/g, '\n\n');
  filtered = filtered.replace(/[ \t]+/g, ' ');
  
  // Limit the content length to prevent abuse
  if (filtered.length > 30000) {
    filtered = filtered.substring(0, 30000) + "\n...[Content truncated due to length]";
  }
  
  return filtered.trim();
}

// Validate content is likely a EULA before sending
function validateEulaContent(content) {
  // Check for minimum content length
  if (!content || content.length < 500) {
    return false;
  }
  
  const contentLower = content.toLowerCase();
  
  // Check for common section headers that indicate a legal document
  const sectionHeaders = [
    'terms of service',
    'terms and conditions',
    'privacy policy',
    'acceptable use',
    'user agreement',
    'using our services',
    'account registration',
    'your obligations',
    'our rights',
    'intellectual property',
    'limitation of liability',
    'warranty disclaimer',
    'termination',
    'governing law',
    'contact information',
    'changes to terms',
    'privacy rights',
    'data collection',
    'user content',
    'disclaimer of warranties'
  ];
  
  // Count how many section headers appear
  const sectionHeaderCount = sectionHeaders.filter(header => 
    contentLower.includes(header.toLowerCase())
  ).length;
  
  // Check for common legal terms
  const legalTerms = [
    'terms', 'conditions', 'agreement', 'rights', 'obligations', 
    'privacy', 'policy', 'consent', 'license', 'warranty', 
    'liability', 'disclaimer', 'termination', 'copyright',
    'collect', 'process', 'data', 'information',
    'use', 'share', 'protect', 'security',
    'accept', 'agree', 'comply', 'govern'
  ];
  
  // Count how many legal terms appear in the content
  const legalTermCount = legalTerms.filter(term => 
    contentLower.includes(term.toLowerCase())
  ).length;
  
  // More specific legal phrases that indicate a legal document
  const specificLegalPhrases = [
    "hereby agrees to",
    "subject to the following terms",
    "reserves the right to",
    "shall not be liable",
    "may terminate this agreement",
    "without prior notice",
    "intellectual property rights",
    "governing law",
    "dispute resolution",
    "by using this",
    "you agree to",
    "we collect",
    "we process",
    "we may share",
    "your consent",
    "privacy rights",
    "data protection"
  ];
  
  // Count specific legal phrases
  const specificPhraseCount = specificLegalPhrases.filter(phrase => 
    contentLower.includes(phrase.toLowerCase())
  ).length;
  
  // Check for numbered sections (common in legal documents)
  const hasNumberedSections = /\b\d+\.\s+[A-Z][a-zA-Z\s]+/.test(content);
  
  // Check for ALL CAPS sections (common in legal documents for emphasis)
  const hasAllCapsWarnings = /[A-Z]{5,}/.test(content);
  
  // More comprehensive validation:
  // - Must have either 2+ section headers OR 3+ legal terms
  // - Must have at least 1 specific legal phrase
  // - Having numbered sections OR all-caps warnings is a strong indicator
  return (sectionHeaderCount >= 2 || legalTermCount >= 3) && 
         specificPhraseCount >= 1 && 
         (hasNumberedSections || hasAllCapsWarnings);
}

// Create and display the overlay
function createOverlay() {
  // Check if overlay already exists
  if (document.querySelector('.termwise-overlay')) {
    return;
  }

  // Create overlay container
  const overlay = document.createElement('div');
  overlay.className = 'termwise-overlay termwise-overlay-animate-in';
  
  // Create overlay header
  const header = document.createElement('div');
  header.className = 'termwise-overlay-header';
  
  // Create title with icon
  const title = document.createElement('div');
  title.className = 'termwise-overlay-title';
  
  // Add icon to title
  const icon = document.createElement('img');
  icon.className = 'termwise-overlay-title-icon';
  icon.src = chrome.runtime.getURL('icons/icon24.png');
  icon.alt = 'TermWise';
  
  title.appendChild(icon);
  title.appendChild(document.createTextNode('TermWise'));
  
  // Add title to header
  header.appendChild(title);
  
  // Create content
  const content = document.createElement('div');
  content.className = 'termwise-overlay-content';
  
  const message = document.createElement('div');
  message.className = 'termwise-overlay-message';
  message.textContent = 'EULA or Terms & Conditions detected on this page. Would you like to analyze it?';
  
  // Create action buttons
  const actions = document.createElement('div');
  actions.className = 'termwise-overlay-actions';
  
  const analyzeBtn = document.createElement('button');
  analyzeBtn.className = 'termwise-overlay-action-button termwise-overlay-primary-button';
  analyzeBtn.textContent = 'Analyze';
  analyzeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openSidePanel();
  });
  
  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'termwise-overlay-action-button termwise-overlay-secondary-button';
  dismissBtn.textContent = 'Dismiss';
  dismissBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeOverlay();
  });
  
  actions.appendChild(analyzeBtn);
  actions.appendChild(dismissBtn);
  
  // Assemble the overlay
  content.appendChild(message);
  content.appendChild(actions);
  overlay.appendChild(header);
  overlay.appendChild(content);
  
  // Add the overlay to the document
  document.body.appendChild(overlay);
  
  // Make the overlay draggable by the header
  makeDraggable(overlay, header);
  
  // Ensure the overlay is visible
  setTimeout(() => {
    overlay.style.transform = 'translateX(0)';
    overlay.style.opacity = '1';
  }, 0);
}

// Make an element draggable
function makeDraggable(element, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  handle.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
    e.preventDefault();
    // Get the mouse cursor position at startup
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // Call a function whenever the cursor moves
    document.onmousemove = elementDrag;
  }
  
  function elementDrag(e) {
    e.preventDefault();
    // Calculate the new cursor position
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // Set the element's new position
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.right = 'auto';
    element.style.left = (element.offsetLeft - pos1) + "px";
  }
  
  function closeDragElement() {
    // Stop moving when mouse button is released
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Close the overlay
function closeOverlay() {
  const overlay = document.querySelector('.termwise-overlay');
  if (overlay) {
    overlay.style.animation = 'none';
    overlay.style.transform = 'translateX(100%)';
    overlay.style.opacity = '0';
    
    // Remove after animation completes
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
  }
}

// Open side panel and analyze content
function openSidePanel() {
  // Use the pre-validated content
  const content = window._validatedEulaContent;
  
  // Show loading indicator
  const analyzeBtn = document.querySelector('.termwise-overlay-primary-button');
  if (analyzeBtn) {
    analyzeBtn.textContent = 'Analyzing...';
    analyzeBtn.disabled = true;
  }
  
  // Send message to background script to open side panel and analyze content
  chrome.runtime.sendMessage({ 
    action: "extract_and_analyze_eula", 
    eulaContent: content,
    url: window.location.href
  }, response => {
    if (response && response.success) {
      console.log("EULA content sent for analysis");
      closeOverlay();
    } else {
      console.error("Error sending EULA content:", response ? response.error : "Unknown error");
      // Reset button state
      if (analyzeBtn) {
        analyzeBtn.textContent = 'Analyze';
        analyzeBtn.disabled = false;
      }
    }
  });
} 