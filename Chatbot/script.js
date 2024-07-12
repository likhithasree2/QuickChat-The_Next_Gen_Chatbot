// Global variables for voice recognition and speech synthesis
let recognition;
let isRecording = false;
let speechSynthesisInstance = window.speechSynthesis;

// Global variables for tracking image loading
let currentObject = null;
let currentPage = 1;

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
        document.getElementById("voice-input").style.backgroundColor =
          "#3498db";
        isRecording = false;
      };

      recognition.start();
      document.getElementById("voice-input").style.backgroundColor = "#a3d9f5"; // Pale blue for recording
      isRecording = true;
    } else {
      alert(
        "Speech recognition is not supported in your browser. Please use a modern browser like Chrome."
      );
    }
  } else {
    recognition.stop();
  }
}

// Function to open file explorer for image upload
function openFileExplorer() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.addEventListener("change", handleFileSelection);
  fileInput.click();
}

// Function to handle selected file for image upload
function handleFileSelection(event) {
  const fileInput = event.target;
  const selectedFile = fileInput.files[0];

  if (selectedFile) {
    const imageUrl = URL.createObjectURL(selectedFile);
    appendMessage(
      "user",
      `<img src="${imageUrl}" alt="user-image" class="uploaded-image">`
    );
  }
}

// Function to send user message and process input
function sendMessage() {
  var userInput = document.getElementById("user-input").value;
  if (userInput.trim() === "") return;

  appendMessage("user", userInput);

  // Check if user requested object photos
  const regex = /(.*?)\s+(photos|images)/i;
  const match = userInput.match(regex);
  if (match && match.length > 1) {
    const object = match[1]; // Extract object name
    generateObjectImages(object);
  } else {
    searchWikipedia(userInput);
  }

  document.getElementById("user-input").value = "";
}

// Function to generate object images using Unsplash API
function generateObjectImages(object) {
  const accessKey = "_cTll8sRIYBo5bYfr52ktD9HpOYRpsXoKE4_5yZRzbg";
  const chatContainer = document.getElementById("chat");

  // Reset currentObject and currentPage if object changes
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
        let imagesHTML = '<div class="bot">';
        imagesHTML += `<h3>${object.charAt(0).toUpperCase() + object.slice(1)} Images</h3><div class="image-grid">`;

        results.forEach(result => {
          imagesHTML += `<div><img src="${result.urls.small}" alt="${object}-image" class="uploaded-image"></div>`;
        });

        // Add Load More button if there are more pages
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

// Function to append message to chat container
// Function to append message to chat container
// Function to append message to chat container
function appendMessage(sender, message) {
  var chatContainer = document.getElementById("chat");
  var messageElement = document.createElement("div");
  messageElement.classList.add(sender);
  
  // Add sender icon and CSS class based on sender
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

  // Add message content
  var messageContent = document.createElement("div");
  messageContent.classList.add("message-content");
  messageContent.innerHTML = message;
  messageElement.appendChild(messageContent);

  // Add read out loud button for bot messages
  if (sender === "bot" && !message.includes("<img")) {
    var readoutButton = document.createElement("button");
    readoutButton.innerHTML = '<i class="fas fa-volume-up"></i>';
    readoutButton.classList.add("readout-button");
    readoutButton.onclick = function() {
      toggleReadOutLoud(message);
    };
    messageElement.appendChild(readoutButton);

    // Add copy button for bot messages (optional)
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


// Function to search Wikipedia for user query
function searchWikipedia(query) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&explaintext&redirects=1&titles=${query}&origin=*`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.query && data.query.pages) {
        const pages = data.query.pages;
        const pageIds = Object.keys(pages);
        if (pageIds.length > 0) {
          const pageId = pageIds[0];
          const pageData = pages[pageId];
          const snippet = pageData.extract;
          const resultMessage = `${snippet}... <a href="https://en.wikipedia.org/wiki/${query}" target="_blank">Read more on Wikipedia</a>`;
          appendMessage("bot", resultMessage);
        } else {
          appendMessage("bot", "No results found on Wikipedia.");
        }
      } else {
        appendMessage("bot", "Failed to retrieve Wikipedia search results.");
      }
    })
    .catch(error => {
      console.error("Error fetching Wikipedia search results:", error);
      appendMessage("bot", "Failed to retrieve Wikipedia search results.");
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
