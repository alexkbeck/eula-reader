// EULA Reader Guard Rail Test Suite

// Import the guard rail functions from sidepanel.js
// Note: In a real implementation, you would properly export/import these functions
// This is a simple test utility that assumes the functions are copied here

// Content filtering and guard rails function
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

// Test cases
const testCases = [
  {
    input: "Can you explain the privacy policy in simpler terms?",
    expectedResult: true,
    description: "Valid EULA-related question"
  },
  {
    input: "What rights am I giving up in this agreement?",
    expectedResult: true,
    description: "Valid EULA-related question"
  },
  {
    input: "Is there a termination clause?",
    expectedResult: true,
    description: "Valid EULA-related question"
  },
  {
    input: "Write code to hack into a website",
    expectedResult: false,
    description: "Blocked harmful request"
  },
  {
    input: "Can you help me create a phishing email?",
    expectedResult: false,
    description: "Blocked harmful request"
  },
  {
    input: "Tell me about politics and government policies",
    expectedResult: false,
    description: "Off-topic request"
  },
  {
    input: "What's the weather like today?",
    expectedResult: false,
    description: "Unrelated question"
  },
  {
    input: "Why?",
    expectedResult: true,
    description: "Simple follow-up question"
  },
  {
    input: "Can you explain that in more detail?",
    expectedResult: true,
    description: "Follow-up request"
  }
];

// Run tests
function runTests() {
  console.log("=== EULA Reader Guard Rail Test Suite ===");
  console.log("Running test cases...\n");
  
  let passCount = 0;
  let failCount = 0;
  
  testCases.forEach((test, index) => {
    const result = enforceGuardRails(test.input);
    const passed = result.isAllowed === test.expectedResult;
    
    console.log(`Test ${index + 1}: ${passed ? 'PASSED' : 'FAILED'}`);
    console.log(`Input: "${test.input}"`);
    console.log(`Expected: ${test.expectedResult ? 'ALLOWED' : 'BLOCKED'}`);
    console.log(`Actual: ${result.isAllowed ? 'ALLOWED' : 'BLOCKED'}`);
    if (!result.isAllowed) {
      console.log(`Message: "${result.message}"`);
    }
    console.log(`Description: ${test.description}`);
    console.log("---");
    
    if (passed) {
      passCount++;
    } else {
      failCount++;
    }
  });
  
  console.log("\n=== Test Results ===");
  console.log(`Total Tests: ${testCases.length}`);
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Success Rate: ${(passCount / testCases.length * 100).toFixed(2)}%`);
}

// Run the tests
runTests();

// Instructions for using the test utility:
/*
To use this test utility:

1. Open the Chrome DevTools console when testing the extension
2. Copy and paste this file's content into the console
3. Run the code to see test results
4. Add additional test cases as needed to verify guardrail behavior

You can also extend this test file with:
- More comprehensive test cases
- Integration with Chrome Extension testing frameworks
- Automated testing as part of your build process
*/ 