// Side panel functionality for EULA Reader

// Initialize markdown-it
const md = window.markdownit ? window.markdownit({
  html: false,        // Disable HTML tags in source
  xhtmlOut: false,    // Use '/' to close single tags (<br />)
  breaks: true,       // Convert '\n' in paragraphs into <br>
  linkify: true,      // Autoconvert URL-like text to links
  typographer: true,  // Enable smartypants and other sweet transforms
  highlight: function (str, lang) {
    if (lang && hljs && hljs.getLanguage && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return ''; // use external default escaping
  }
}) : null;

// DOM Elements
const initialState = document.getElementById('initial-state');
const loadingState = document.getElementById('loading-state');
const summaryState = document.getElementById('summary-state');
const summaryContent = document.getElementById('summary-content');
const chatMessages = document.getElementById('chat-messages');
const userQuestion = document.getElementById('user-question');

// Variables to store the current conversation context
let currentEulaContent = '';
let currentUrl = '';
let conversationHistory = [];

// Content filtering and guard rails
function enforceGuardRails(userInput) {
  // List of disallowed topics or intents
  const blockedTopics = [
    'generate code', 'write code', 'programming', 
    'hack', 'exploit', 'bypass', 
    'create malware', 'phishing', 
    'illegal', 'immoral', 'unethical',
    'adult content', 'explicit', 'sexual',
    'political', 'extremist', 'terrorist',
    'violence', 'weapon', 'bomb'
  ];
  
  // If user input doesn't relate to EULA analysis or legal document understanding
  const allowedTopics = [
    'terms', 'agreement', 'eula', 'policy', 'contract', 'legal', 'privacy', 
    'clause', 'condition', 'terms of service', 'tos', 'rights', 'license', 
    'provision', 'consent', 'liability', 'obligation', 'terminate', 'copyright'
  ];
  
  // Check if input contains blocked topics
  const containsBlockedTopic = blockedTopics.some(topic => 
    userInput.toLowerCase().includes(topic.toLowerCase())
  );
  
  // Check if input relates to EULA/legal document analysis
  const relatedToEulas = allowedTopics.some(topic => 
    userInput.toLowerCase().includes(topic.toLowerCase())
  );
  
  // Reject if the input contains blocked topics
  if (containsBlockedTopic) {
    return {
      isAllowed: false,
      message: "I'm designed specifically to help with EULA and Terms of Service analysis. I can't assist with potentially harmful or off-topic requests."
    };
  }
  
  // If the question seems unrelated to EULA analysis and isn't a simple follow-up
  if (userInput.length > 30 && !relatedToEulas && !isLikelyFollowUp(userInput)) {
    return {
      isAllowed: false,
      message: "I can only help with questions about this EULA or Terms of Service document. Please ask something related to understanding the legal agreement."
    };
  }
  
  // Allow the input
  return {
    isAllowed: true
  };
}

// Helper function to determine if a question is likely a follow-up
function isLikelyFollowUp(text) {
  const followUpPhrases = [
    'what about', 'can you explain', 'tell me more', 'what does that mean',
    'clarify', 'elaborate', 'why', 'how', 'what if', 'is there', 'are there',
    'do they', 'does this', 'can they', 'can i', 'would i'
  ];
  
  return followUpPhrases.some(phrase => 
    text.toLowerCase().includes(phrase.toLowerCase())
  ) || text.endsWith('?');
}

// Function to ensure the system prompt enforces guardrails
function getGuardedSystemPrompt() {
  return {
    role: "system",
    content: `You are a legal expert tasked with advising clients about legal agreements. Your analysis MUST:
      1. Be ultra-concise with your respone. Your response should be readable in under 45 seconds
      4. Only mention potential concerns or unusual clauses a user should be aware of
      2. Start immediately with a bulleted list of potential concerns - no introduction or headers explaining what the document is
      3. Use clear, efficient language focusing only on substantive terms that affect the user
      5. Include a final section with your professional recommendation on whether to agree, presented as "My advice:"
      6. Omit standard/boilerplate clauses unless they contain unusual provisions
      7. Skip pleasantries, unnecessary context, or any explanation of what you're doing

      IMPORTANT CONSTRAINTS:
      - You MUST ONLY respond to questions about the legal document being analyzed
      - You MUST REFUSE to assist with any requests unrelated to understanding legal agreements
      - You MUST NOT generate content on sensitive topics or provide advice on illegal activities
      - You MUST NOT write code or assist with technical development tasks
      - If asked anything outside your scope, politely redirect to legal document analysis`
  };
}

// Default LLM API configuration
const DEFAULT_API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_API_KEY = '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';
const DEFAULT_MODEL = 'google/gemini-2.0-flash-lite-preview-02-05:free';

// LLM API configuration (will be updated from storage)
let LLM_API_ENDPOINT = DEFAULT_API_ENDPOINT;
let LLM_API_KEY = DEFAULT_API_KEY;
let LLM_MODEL = DEFAULT_MODEL;

// Load settings from Chrome storage
function loadSettings() {
  chrome.storage.sync.get(['apiKey', 'modelChoice', 'apiEndpoint'], (result) => {
    if (result.apiKey) {
      LLM_API_KEY = result.apiKey;
    }
    
    if (result.modelChoice) {
      LLM_MODEL = result.modelChoice;
    }
    
    if (result.apiEndpoint) {
      LLM_API_ENDPOINT = result.apiEndpoint;
    }
  });
}

// Check for pending EULA data
function checkForPendingEulaData() {
  console.log("Checking for pending EULA data");
  
  chrome.runtime.sendMessage({ action: "get_pending_eula_data" }, (response) => {
    if (response && response.shouldProcess && response.content) {
      console.log("Found pending EULA data, processing...");
      
      // Store the EULA content and URL
      currentEulaContent = response.content;
      currentUrl = response.url;
      
      // Reset conversation history
      conversationHistory = [];
      
      // Show loading state
      showLoadingState();
      
      // Process the EULA content
      processEulaContent(currentEulaContent, currentUrl);
    }
  });
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Load settings, check for pending EULA data
  loadSettings();
  checkForPendingEulaData();
  
  // Set up event listeners for the user input
  userQuestion.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleUserQuestion();
    }
  });
  
  // Set up event listener for the send button
  const sendButton = document.getElementById('send-button');
  if (sendButton) {
    sendButton.addEventListener('click', () => {
      handleUserQuestion();
    });
  }
  
  // Add click event listeners for action buttons
  document.querySelectorAll('.action-btn').forEach(button => {
    button.addEventListener('click', () => {
      const prompt = button.getAttribute('data-prompt');
      if (prompt) {
        addUserMessageToChat(prompt);
        sendFollowUpQuestion(prompt);
      }
    });
  });
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Sidepanel received message:", message.action);
  
  if (message.action === 'process_eula') {
    console.log("Processing EULA content in sidepanel");
    
    // Reload settings in case they changed
    loadSettings();
    
    // Store the EULA content and URL
    currentEulaContent = message.eulaContent;
    currentUrl = message.url;
    
    // Reset conversation history
    conversationHistory = [];
    
    // Show loading state
    showLoadingState();
    
    // Process the EULA content
    processEulaContent(currentEulaContent, currentUrl);
    
    sendResponse({ status: 'processing' });
  }
  
  return true; // Keep message channel open for async response
});

// Show loading state
function showLoadingState() {
  initialState.classList.add('hidden');
  summaryState.classList.add('hidden');
  loadingState.classList.remove('hidden');
}

// Show summary state
function showSummaryState() {
  initialState.classList.add('hidden');
  loadingState.classList.add('hidden');
  summaryState.classList.remove('hidden');
}

// Process EULA content with LLM
async function processEulaContent(eulaContent, url) {
  try {
    // Create system prompt with guard rails
    const systemPrompt = getGuardedSystemPrompt();
    
    // Create user prompt with the EULA content
    const userPrompt = {
      role: "user",
      content: `Analyze this legal document as my lawyer and provide only the essential points I need to know:\n\n${eulaContent.substring(0, 15000)}`
    };
    
    // Set up conversation
    conversationHistory = [systemPrompt, userPrompt];
    
    // Get reference to the summary content element
    const summaryContentElement = document.getElementById('summary-content');
    
    // Make streaming request to the LLM API
    await streamLlmResponse(conversationHistory, summaryContentElement);
    
    // Show the summary state
    showSummaryState();
    
  } catch (error) {
    console.error('Error processing EULA content:', error);
    summaryContent.textContent = 'Error analyzing the document. Please try again.';
    showSummaryState();
  }
}

// Handle user follow-up questions
function handleUserQuestion() {
  const question = userQuestion.value.trim();
  if (!question) return;
  
  // Clear the input field
  userQuestion.value = '';
  
  // Add the user message to the chat
  addUserMessageToChat(question);
  
  // Process the follow-up question
  sendFollowUpQuestion(question);
}

// Add user message to chat
function addUserMessageToChat(message) {
  const messageElement = document.createElement('div');
  messageElement.className = 'message user-message';
  messageElement.innerHTML = `<div class="user-bubble">${message}</div>`;
  chatMessages.appendChild(messageElement);
  
  // Scroll to the bottom of the messages
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add AI message to chat
function addAiMessageToChat() {
  const messageElement = document.createElement('div');
  messageElement.className = 'message ai-message';
  messageElement.innerHTML = `<div class="ai-bubble markdown-content"></div>`;
  chatMessages.appendChild(messageElement);
  
  // Scroll to the bottom of the messages
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  return messageElement.querySelector('.ai-bubble');
}

// Send follow-up question to LLM
async function sendFollowUpQuestion(question) {
  try {
    // Apply guard rails to the user question
    const guardRailCheck = enforceGuardRails(question);
    
    if (!guardRailCheck.isAllowed) {
      // Add user question to chat
      conversationHistory.push({ role: "user", content: question });
      
      // Create a message element for the AI response and display the guard rail message
      const aiMessageElement = addAiMessageToChat();
      aiMessageElement.textContent = guardRailCheck.message;
      
      // Add the guard rail message to conversation history
      conversationHistory.push({ role: "assistant", content: guardRailCheck.message });
      
      // Scroll to bottom after response
      chatMessages.scrollTop = chatMessages.scrollHeight;
      return;
    }
    
    // Add user question to conversation history
    conversationHistory.push({ role: "user", content: question });
    
    // Create a message element for the AI response
    const aiMessageElement = addAiMessageToChat();
    
    // Make streaming request to the LLM API
    await streamLlmResponse(conversationHistory, aiMessageElement);
    
    // Scroll to bottom after response
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
  } catch (error) {
    console.error('Error sending follow-up question:', error);
    const aiMessageElement = addAiMessageToChat();
    aiMessageElement.textContent = 'Error processing your question. Please try again.';
  }
}

// Stream the LLM response to the specified element
async function streamLlmResponse(messages, outputElement) {
  try {
    // Check if API Key is set
    if (!LLM_API_KEY) {
      outputElement.innerHTML = 'API key not configured. Please <a href="options.html" target="_blank">set your LLM API key</a> in the extension options.';
      return;
    }

    // Ensure the system prompt has guard rails
    if (messages.length > 0 && messages[0].role === "system") {
      messages[0] = getGuardedSystemPrompt();
    } else if (messages.length === 0 || messages[0].role !== "system") {
      messages.unshift(getGuardedSystemPrompt());
    }

    // Create text decoder for streaming
    const decoder = new TextDecoder();
    let responseText = '';
    let renderedText = '';
    
    // Prepare the request body based on the model
    const isOpenRouter = LLM_API_ENDPOINT.includes('openrouter.ai');
    
    // Load generation config from storage
    let generationConfig = await new Promise(resolve => {
      chrome.storage.sync.get(['generationConfig'], (data) => {
        resolve(data.generationConfig || {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
          presencePenalty: 0,
          frequencyPenalty: 0,
          stopSequences: [],
          responseType: ""
        });
      });
    });
    
    // Create the request body
    const requestBody = {
      model: LLM_MODEL,
      messages: messages,
      stream: true,
      max_tokens: generationConfig.maxOutputTokens || 1024
    };
    
    // Add OpenRouter specific fields if using OpenRouter
    if (isOpenRouter) {
      requestBody.http_referer = "https://termwise.extension";
      requestBody.temperature = generationConfig.temperature || 0.7;
      requestBody.top_p = generationConfig.topP || 0.8;
      requestBody.top_k = generationConfig.topK || 40;
      
      if (generationConfig.presencePenalty > 0) {
        requestBody.presence_penalty = generationConfig.presencePenalty;
      }
      
      if (generationConfig.frequencyPenalty > 0) {
        requestBody.frequency_penalty = generationConfig.frequencyPenalty;
      }
      
      if (generationConfig.stopSequences && generationConfig.stopSequences.length > 0) {
        requestBody.stop = generationConfig.stopSequences;
      }
      
      if (generationConfig.responseType) {
        requestBody.response_format = { type: generationConfig.responseType.toLowerCase() };
      }
    }
    
    // Create headers
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add appropriate authorization header
    if (isOpenRouter) {
      headers['Authorization'] = `Bearer ${LLM_API_KEY}`;
      headers['HTTP-Referer'] = 'https://termwise.extension';
      headers['X-Title'] = 'TermWise Extension';
    } else {
      // Assume OpenAI-compatible API
      headers['Authorization'] = `Bearer ${LLM_API_KEY}`;
    }
    
    // Make the API request
    const response = await fetch(LLM_API_ENDPOINT, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }
    
    // Process the streaming response
    const reader = response.body.getReader();
    
    // Set up a timer to periodically render markdown
    let updateTimer = null;
    const updateInterval = 100; // ms
    
    const updateMarkdown = () => {
      // Render markdown and update the element
      if (md) {
        outputElement.innerHTML = md.render(responseText);
        
        // Apply syntax highlighting to code blocks if hljs is available
        if (window.hljs) {
          outputElement.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
          });
        }
      } else {
        // Fallback if markdown-it is not available
        outputElement.textContent = responseText;
      }
    };
    
    // Start the update timer
    updateTimer = setInterval(updateMarkdown, updateInterval);
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // Process the chunk of data
      const chunk = decoder.decode(value);
      
      // Parse the SSE data to extract content
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          
          // Check for [DONE] message
          if (data === '[DONE]') continue;
          
          try {
            const json = JSON.parse(data);
            
            // Extract content based on API format
            let content = '';
            
            if (isOpenRouter) {
              // OpenRouter format
              if (json.choices && json.choices[0]?.delta?.content) {
                content = json.choices[0].delta.content;
              }
            } else {
              // OpenAI-compatible format
              if (json.choices && json.choices[0]?.delta?.content) {
                content = json.choices[0].delta.content;
              }
            }
            
            if (content) {
              responseText += content;
            }
          } catch (e) {
            console.error('Error parsing JSON from stream:', e);
          }
        }
      }
    }
    
    // Clear the update timer
    clearInterval(updateTimer);
    
    // Final markdown render
    updateMarkdown();
    
    // Add the full response to conversation history
    conversationHistory.push({ role: "assistant", content: responseText });
    
  } catch (error) {
    console.error('Error streaming LLM response:', error);
    if (md) {
      outputElement.innerHTML = md.render(`**Error communicating with AI service:** ${error.message}. Please check your API settings and try again.`);
    } else {
      outputElement.textContent = `Error communicating with AI service: ${error.message}. Please check your API settings and try again.`;
    }
  }
} 