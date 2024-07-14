// Global variables for voice recognition and speech synthesis
let recognition;
let isRecording = false;
let speechSynthesisInstance = window.speechSynthesis;

// Global variables for tracking image loading
let currentObject = null;
let currentPage = 1;

// Global variables for video pagination
let currentVideoQuery = null;
let currentVideoPage = 1;

// Gemini API key and endpoint
const GEMINI_API_KEY = 'GEMINI_API_KEY'; //PLACE YOUR GEMINI API KEY
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

// Pexels API key and endpoint
const PEXELS_API_KEY = 'PEXELS_API_KEY'; //PLACE YOUR PEXELS API KEY
const PEXELS_API_URL = 'https://api.pexels.com/videos/search';

// Function to toggle dark mode
function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle("dark-mode");

  const darkModeIcon = document.getElementById("dark-mode-icon");
  darkModeIcon.classList.toggle("fa-sun");
  darkModeIcon.classList.toggle("fa-moon");

  if (body.classList.contains("dark-mode")) {
    darkModeIcon.style.color = "#ffffff"; 
  } else {
    darkModeIcon.style.color = ""; 
  }
}

// Function to start voice recognition
function startVoiceRecognition() {
  if (!isRecording) {
    if ("webkitSpeechRecognition" in window) {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById("user-input").value = transcript;
        sendMessage();
      };

      recognition.onend = function () {
        document.getElementById("voice-input").style.backgroundColor = "#3498db";
        isRecording = false;
      };

      recognition.start();
      document.getElementById("voice-input").style.backgroundColor = "#a3d9f5";
      isRecording = true;
    } else {
      alert("Speech recognition is not supported in your browser. Please use a modern browser like Chrome.");
    }
  } else {
    recognition.stop();
  }
}

// Function to open file explorer for document upload
function openFileExplorer() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".txt,.doc,.docx,.pdf";
  fileInput.addEventListener("change", handleFileSelection);
  fileInput.click();
}

// Function to extract text from the uploaded file
function extractTextFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

// Function to handle selected file for document upload
async function handleFileSelection(event) {
  const fileInput = event.target;
  const selectedFile = fileInput.files[0];

  if (selectedFile) {
    try {
      const extractedText = await extractTextFromFile(selectedFile);
      window.extractedDocumentText = extractedText;
      appendMessage("user", `File uploaded: ${selectedFile.name}`);
      appendMessage("bot", "File content extracted. Type 'summarize' to get a summary, or type any question you have about the document.");
    } catch (error) {
      console.error("Error extracting text from file:", error);
      appendMessage("bot", "Sorry, there was an error processing the file.");
    }
  }
}

// Function to send user message and process input
function sendMessage() {
  var userInput = document.getElementById("user-input").value;
  if (userInput.trim() === "") return;

  appendMessage("user", userInput, true);
  processUserInput(userInput);

  document.getElementById("user-input").value = "";
  
  // Hide the chat title and never show it again
  const chatTitle = document.getElementById("chat-title");
  chatTitle.style.display = "none";
}

// Function to process user input
function processUserInput(userInput) {
  const imageRegex = /(.*?)\s+(photos|images)/i;
  const videoRegex = /(.*?)\s+(video|videos)/i;
  const imageMatch = userInput.match(imageRegex);
  const videoMatch = userInput.match(videoRegex);

  if (videoMatch && videoMatch.length > 1) {
    const object = videoMatch[1];
    generateObjectVideos(object);
  } else if (imageMatch && imageMatch.length > 1) {
    const object = imageMatch[1];
    generateObjectImages(object);
  } else if (userInput.toLowerCase() === "summarize" && window.extractedDocumentText) {
    summarizeDocument();
  } else if (window.extractedDocumentText) {
    askQuestionAboutDocument(userInput);
  } else if (userInput.toLowerCase() === "what's the time?" || userInput.toLowerCase() === "current time") {
    fetchTime();
  } else if (userInput.toLowerCase() === "tell me a joke" || userInput.toLowerCase() === "joke") {
    fetchJoke();
  } else {
    generateGeminiResponse(userInput);
  }
}

// Function to generate object images using Unsplash API
function generateObjectImages(object) {
  const accessKey = "UNSPLASH_API_KEY"; //PLACE YOUR UNSPLASH API KEY
  const chatContainer = document.getElementById("chat");

  if (currentObject !== object) {
    currentObject = object;
    currentPage = 1;
  }

  const url = `https://api.unsplash.com/search/photos?page=${currentPage}&query=${object}&client_id=${accessKey}&per_page=4`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.results.length > 0) {
        const results = data.results;
        let imagesHTML = '<div class="bot image-container">';
        imagesHTML += `<h3>${object.charAt(0).toUpperCase() + object.slice(1)} Images</h3><div class="image-grid">`;

        results.forEach(result => {
          imagesHTML += `<div><img src="${result.urls.small}" alt="${object}-image" class="uploaded-image"></div>`;
        });

        if (data.total_pages > currentPage) {
          imagesHTML += `<button class="load-more-button" onclick="loadMoreImages('${object}')">Load More</button>`;
        }

        imagesHTML += '</div></div>';

        appendMessage("bot", imagesHTML);
      } else {
        appendMessage("bot", `No ${object} images found.`);
      }
    })
    .catch(error => {
      console.error(`Error fetching ${object} images:`, error);
      appendMessage("bot", `Failed to fetch ${object} images.`);
    });
}

// Function to load more images for the current object
function loadMoreImages(object) {
  currentPage++;
  generateObjectImages(object);
}

// Function to generate object videos using Pexels API
async function generateObjectVideos(object) {
  if (currentVideoQuery !== object) {
    currentVideoQuery = object;
    currentVideoPage = 1;
  }

  const videos = await fetchVideos(object, currentVideoPage);
  displayVideos(videos, object);
}

// Function to fetch videos from Pexels API
async function fetchVideos(query, page = 1) {
  try {
    const response = await fetch(`${PEXELS_API_URL}?query=${encodeURIComponent(query)}&per_page=4&page=${page}`, {
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.videos || [];
  } catch (error) {
    console.error('Failed to fetch videos:', error);
    return [];
  }
}

// Function to display videos in chat
function displayVideos(videos, object) {
  let videosHTML = '<div class="bot video-container">';
  videosHTML += `<h3>${object.charAt(0).toUpperCase() + object.slice(1)} Videos</h3><div class="video-grid">`;

  videos.forEach(video => {
    videosHTML += `
      <div class="video-item">
        <video width="320" height="240" controls>
          <source src="${video.video_files[0].link}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>
    `;
  });

  videosHTML += '</div>';
  videosHTML += `<button class="load-more-button" onclick="loadMoreVideos('${object}')">Load More</button>`;
  videosHTML += '</div>';

  appendMessage("bot", videosHTML);
}

// Function to load more videos
function loadMoreVideos(object) {
  currentVideoPage++;
  generateObjectVideos(object);
}

// Function to append message to chat container
function appendMessage(sender, message, isEditable = false) {
  var chatContainer = document.getElementById("chat");
  var messageElement = document.createElement("div");
  messageElement.classList.add(sender);
  
  var senderIcon = document.createElement("div");
  senderIcon.classList.add("icon-circle");
  if (sender === "bot") {
    senderIcon.innerHTML = '<i class="fas fa-robot"></i>';
    messageElement.classList.add("bot-message");
  } else if (sender === "user") {
    senderIcon.innerHTML = '<i class="fas fa-user"></i>';
    messageElement.classList.add("user-message");
  }

  messageElement.appendChild(senderIcon);

  // Create container for message content and edit button
  var messageContainer = document.createElement("div");
  messageContainer.classList.add("message-container");
  
  var messageContent = document.createElement("div");
  messageContent.classList.add("message-content");
  messageContent.innerHTML = message;
  messageContainer.appendChild(messageContent);

  if (isEditable) {
    var editButton = document.createElement("button");
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.classList.add("edit-button");
    editButton.onclick = function() {
      editMessage(messageContent, message);
    };
    messageContainer.appendChild(editButton);
  }

  messageElement.appendChild(messageContainer);

  if (sender === "bot" && !message.includes("<img") && !message.includes("<video")) {
    var readoutButton = document.createElement("button");
    readoutButton.innerHTML = '<i class="fas fa-volume-up"></i>';
    readoutButton.classList.add("readout-button");
    readoutButton.onclick = function() {
      toggleReadOutLoud(message);
    };
    messageElement.appendChild(readoutButton);

    var copyButton = document.createElement("button");
    copyButton.innerHTML = '<i class="far fa-copy"></i>';
    copyButton.classList.add("copy-button");
    copyButton.onclick = function() {
      copyToClipboard(message);
    };
    messageElement.appendChild(copyButton);
  }

  chatContainer.appendChild(messageElement);

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Function to edit a message
function editMessage(messageContent, originalMessage) {
  const container = messageContent.parentNode;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = originalMessage;
  input.classList.add('edit-input');

  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save';
  saveButton.classList.add('save-button');

  saveButton.onclick = function() {
    const newMessage = input.value;
    messageContent.innerHTML = newMessage;
    container.replaceChild(messageContent, input);
    container.removeChild(saveButton);
    processUserInput(newMessage);
  };

  container.replaceChild(input, messageContent);
  container.appendChild(saveButton);
}

// Function to generate response using Gemini API
function generateGeminiResponse(userInput) {
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `Please provide a structured response to the following query. Include a brief introduction, main points (each on a new line starting with a dash), and a conclusion if applicable. Query: ${userInput}`
          }
        ]
      }
    ]
  };

  fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })
    .then(response => response.json())
    .then(data => {
      if (data.candidates && data.candidates.length > 0) {
        let generatedText = data.candidates[0].content.parts[0].text;
        
        generatedText = generatedText.replace(/\n\n/g, '</p><p>');
        generatedText = generatedText.replace(/\n- /g, '</p><p>• ');
        generatedText = `<p>${generatedText}</p>`;
        generatedText = generatedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        generatedText = generatedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        appendMessage("bot", generatedText);
      } else {
        appendMessage("bot", "Sorry, I couldn't generate a response.");
      }
    })
    .catch(error => {
      console.error("Error generating response:", error);
      appendMessage("bot", "Sorry, there was an error generating a response.");
    });
}

// Function to summarize the uploaded document
function summarizeDocument() {
  if (window.extractedDocumentText) {
    const prompt = `Please summarize the following text:\n\n${window.extractedDocumentText}`;
    generateGeminiResponse(prompt);
  } else {
    appendMessage("bot", "No document has been uploaded yet.");
  }
}

// Function to ask a question about the uploaded document
function askQuestionAboutDocument(question) {
  if (window.extractedDocumentText) {
    const prompt = `Given the following text:\n\n${window.extractedDocumentText}\n\nPlease answer this question: ${question}`;
    generateGeminiResponse(prompt);
  } else {
    appendMessage("bot", "No document has been uploaded yet.");
  }
}

// Function to fetch current time
function fetchTime() {
  fetch('http://127.0.0.1:5000/time')
    .then(response => response.json())
    .then(data => {
      appendMessage("bot", `Current time is: ${data.current_time}`);
    })
    .catch(error => {
      console.error('Error fetching time:', error);
      appendMessage("bot", "Failed to fetch current time.");
    });
}

// Function to fetch a joke
function fetchJoke() {
  fetch('http://127.0.0.1:5000/joke')
    .then(response => response.json())
    .then(data => {
      appendMessage("bot", data.joke);
    })
    .catch(error => {
      console.error('Error fetching joke:', error);
      appendMessage("bot", "Failed to fetch a joke.");
    });
}

// Function to toggle read out loud of bot response
let isReading = false;
let currentUtterance = null;

function toggleReadOutLoud(message) {
  if (!isReading) {
    currentUtterance = new SpeechSynthesisUtterance();
    currentUtterance.text = message;
    speechSynthesisInstance.speak(currentUtterance);
    isReading = true;
  } else {
    speechSynthesisInstance.cancel();
    isReading = false;
  }
}

// Function to copy bot response to clipboard
function copyToClipboard(message) {
  navigator.clipboard.writeText(message)
    .then(() => {
      console.log('Bot response copied to clipboard.');
    })
    .catch(err => {
      console.error('Failed to copy bot response: ', err);
    });
}

// Event listener to handle Enter key press
document.getElementById("user-input").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});

// Initialize the chat interface
document.addEventListener('DOMContentLoaded', (event) => {
  const sendButton = document.querySelector('.send-button');
  if (sendButton) {
    sendButton.addEventListener('click', sendMessage);
  }
});
