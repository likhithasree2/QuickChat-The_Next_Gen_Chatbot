let recognition;
let isRecording = false;
let speechSynthesisInstance = window.speechSynthesis;

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

function openFileExplorer() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.addEventListener("change", handleFileSelection);
  fileInput.click();
}

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

function sendMessage() {
  var userInput = document.getElementById("user-input").value;
  if (userInput.trim() === "") return;

  appendMessage("user", userInput);
  searchWikipedia(userInput);

  document.getElementById("user-input").value = "";
}

function appendMessage(sender, message) {
  var chatContainer = document.getElementById("chat");
  var messageElement = document.createElement("div");
  messageElement.classList.add(sender);
  messageElement.innerHTML = message;

  if (sender === "bot") {
    var readoutButton = document.createElement("button");
    readoutButton.innerHTML = '<i class="fas fa-volume-up"></i>';
    readoutButton.classList.add("readout-button");
    readoutButton.onclick = function() {
        toggleReadOutLoud(message);
    };
    messageElement.appendChild(readoutButton);
  }

  if (sender === "user") {
    var editPromptButton = document.createElement("button");
    editPromptButton.innerHTML = '<i class="fas fa-edit"></i>';
    editPromptButton.classList.add("edit-prompt-button");
    var userIcon = document.createElement("div");
    userIcon.classList.add("icon-circle");
    userIcon.innerHTML = '<i class="fas fa-user"></i>';
    messageElement.insertBefore(userIcon, messageElement.firstChild);
    editPromptButton.onclick = function() {
        editPrompt(message);
    };
    messageElement.appendChild(editPromptButton);
  }

  if (sender === "bot") {
    var copyButton = document.createElement("button");
    copyButton.innerHTML = '<i class="far fa-copy"></i>';
    copyButton.classList.add("copy-button");
    var botIcon = document.createElement("div");
    botIcon.classList.add("icon-circle");
    botIcon.innerHTML = '<i class="fas fa-robot"></i>';
    messageElement.insertBefore(botIcon, messageElement.firstChild);
    copyButton.onclick = function() {
        copyToClipboard(message);
    };
    messageElement.appendChild(copyButton);
  }

  chatContainer.appendChild(messageElement);

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

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

function editPrompt(message) {
  document.getElementById("user-input").value = message;
}

function copyToClipboard(message) {
  navigator.clipboard.writeText(message)
    .then(() => {
      console.log('Bot response copied to clipboard.');
    })
    .catch(err => {
      console.error('Failed to copy bot response: ', err);
    });
}
