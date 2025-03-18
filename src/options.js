// Options page functionality for EULA Reader

// Default values for generation config parameters
const DEFAULT_CONFIG = {
  temperature: 0.7,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 1024,
  presencePenalty: 0,
  frequencyPenalty: 0,
  stopSequences: [],
  responseType: ""
};

// Preset configurations
const PRESETS = {
  balanced: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 1024,
    presencePenalty: 0,
    frequencyPenalty: 0
  },
  creative: {
    temperature: 0.9,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 1024,
    presencePenalty: 0,
    frequencyPenalty: 0
  },
  precise: {  // "By the Book"
    temperature: 0.2,
    topP: 0.5,
    topK: 20,
    maxOutputTokens: 1024,
    presencePenalty: 0,
    frequencyPenalty: 0
  },
  concise: {
    temperature: 0.4,
    topP: 0.7,
    topK: 30,
    maxOutputTokens: 512,
    presencePenalty: 0.1,
    frequencyPenalty: 0.1
  },
  detailed: {
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 2048,
    presencePenalty: 0,
    frequencyPenalty: 0
  }
};

// Elements
const elements = {
  // Preset buttons
  presetButtons: document.querySelectorAll('.preset-btn'),
  
  // Range inputs and their value displays
  temperature: document.getElementById('temperature'),
  temperatureValue: document.getElementById('temperature-value'),
  topP: document.getElementById('topP'),
  topPValue: document.getElementById('topP-value'),
  presencePenalty: document.getElementById('presencePenalty'),
  presencePenaltyValue: document.getElementById('presencePenalty-value'),
  frequencyPenalty: document.getElementById('frequencyPenalty'),
  frequencyPenaltyValue: document.getElementById('frequencyPenalty-value'),
  
  // Number and text inputs
  topK: document.getElementById('topK'),
  maxOutputTokens: document.getElementById('maxOutputTokens'),
  stopSequences: document.getElementById('stopSequences'),
  
  // Select inputs
  responseType: document.getElementById('responseType'),
  
  // Buttons
  saveButton: document.getElementById('save'),
  
  // Status message
  statusMessage: document.getElementById('status-message')
};

// Load saved configuration from storage
function loadSavedConfig() {
  chrome.storage.sync.get(['generationConfig', 'activePreset'], (data) => {
    const config = data.generationConfig || DEFAULT_CONFIG;
    const activePreset = data.activePreset || 'balanced';
    
    // Update UI with saved values
    updateUIFromConfig(config);
    
    // Mark active preset
    elements.presetButtons.forEach(button => {
      if (button.dataset.preset === activePreset) {
        button.classList.add('active');
      }
    });
  });
}

// Update UI elements from configuration object
function updateUIFromConfig(config) {
  // Update range inputs and their displayed values
  elements.temperature.value = config.temperature;
  elements.temperatureValue.textContent = config.temperature;
  
  elements.topP.value = config.topP;
  elements.topPValue.textContent = config.topP;
  
  elements.presencePenalty.value = config.presencePenalty;
  elements.presencePenaltyValue.textContent = config.presencePenalty;
  
  elements.frequencyPenalty.value = config.frequencyPenalty;
  elements.frequencyPenaltyValue.textContent = config.frequencyPenalty;
  
  // Update number inputs
  elements.topK.value = config.topK;
  elements.maxOutputTokens.value = config.maxOutputTokens;
  
  // Update text input (stop sequences)
  if (Array.isArray(config.stopSequences) && config.stopSequences.length > 0) {
    elements.stopSequences.value = config.stopSequences.join(',');
  } else {
    elements.stopSequences.value = '';
  }
  
  // Update select input (response type)
  elements.responseType.value = config.responseType || '';
}

// Get current configuration from UI elements
function getConfigFromUI() {
  // Parse stop sequences from comma-separated string to array
  const stopSequencesStr = elements.stopSequences.value.trim();
  const stopSequences = stopSequencesStr ? stopSequencesStr.split(',').map(s => s.trim()) : [];
  
  return {
    temperature: parseFloat(elements.temperature.value),
    topP: parseFloat(elements.topP.value),
    topK: parseInt(elements.topK.value, 10),
    maxOutputTokens: parseInt(elements.maxOutputTokens.value, 10),
    presencePenalty: parseFloat(elements.presencePenalty.value),
    frequencyPenalty: parseFloat(elements.frequencyPenalty.value),
    stopSequences: stopSequences,
    responseType: elements.responseType.value
  };
}

// Save configuration to storage
function saveConfig(config, presetName) {
  chrome.storage.sync.set({
    generationConfig: config,
    activePreset: presetName || null
  }, () => {
    showStatusMessage('Settings saved!');
  });
}

// Show status message for a short time
function showStatusMessage(message) {
  elements.statusMessage.textContent = message;
  elements.statusMessage.style.display = 'block';
  
  // Reset animation
  elements.statusMessage.style.animation = 'none';
  // Trigger reflow
  void elements.statusMessage.offsetWidth;
  // Restart animation
  elements.statusMessage.style.animation = 'fadeOut 3s forwards';
  
  // Hide after animation completes
  setTimeout(() => {
    elements.statusMessage.style.display = 'none';
  }, 3000);
}

// Initialize event listeners
function initEventListeners() {
  // Preset buttons
  elements.presetButtons.forEach(button => {
    button.addEventListener('click', () => {
      const presetName = button.dataset.preset;
      const presetConfig = PRESETS[presetName];
      
      if (presetConfig) {
        // Update UI with preset values
        updateUIFromConfig({
          ...presetConfig,
          stopSequences: elements.stopSequences.value.trim() ? 
                         elements.stopSequences.value.split(',').map(s => s.trim()) : [],
          responseType: elements.responseType.value
        });
        
        // Update active preset
        elements.presetButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
      }
    });
  });
  
  // Range input value displays
  elements.temperature.addEventListener('input', () => {
    elements.temperatureValue.textContent = elements.temperature.value;
    // Remove active preset highlighting when user modifies a setting
    elements.presetButtons.forEach(btn => btn.classList.remove('active'));
  });
  
  elements.topP.addEventListener('input', () => {
    elements.topPValue.textContent = elements.topP.value;
    elements.presetButtons.forEach(btn => btn.classList.remove('active'));
  });
  
  elements.presencePenalty.addEventListener('input', () => {
    elements.presencePenaltyValue.textContent = elements.presencePenalty.value;
    elements.presetButtons.forEach(btn => btn.classList.remove('active'));
  });
  
  elements.frequencyPenalty.addEventListener('input', () => {
    elements.frequencyPenaltyValue.textContent = elements.frequencyPenalty.value;
    elements.presetButtons.forEach(btn => btn.classList.remove('active'));
  });
  
  // Other inputs that should remove active preset highlighting
  [elements.topK, elements.maxOutputTokens, elements.stopSequences, elements.responseType].forEach(element => {
    element.addEventListener('change', () => {
      elements.presetButtons.forEach(btn => btn.classList.remove('active'));
    });
  });
  
  // Save button
  elements.saveButton.addEventListener('click', () => {
    const config = getConfigFromUI();
    
    // Find if current config matches a preset
    let activePreset = null;
    elements.presetButtons.forEach(btn => {
      if (btn.classList.contains('active')) {
        activePreset = btn.dataset.preset;
      }
    });
    
    saveConfig(config, activePreset);
  });
}

// Initialize the options page
function init() {
  loadSavedConfig();
  initEventListeners();
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 