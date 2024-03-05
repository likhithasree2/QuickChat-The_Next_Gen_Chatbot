let recognition;
let isRecording = false;

function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle("dark-mode");

  // Toggle between sun and moon icons
  const darkModeIcon = document.getElementById("dark-mode-icon");
  darkModeIcon.classList.toggle("fa-sun");
  darkModeIcon.classList.toggle("fa-moon");

  // Adjust icon color for dark mode
  if (body.classList.contains("dark-mode")) {
    darkModeIcon.style.color = "#ffffff"; // Set moon icon color to white
  } else {
    darkModeIcon.style.color = ""; // Reset moon icon color to default
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
  // Call Wikipedia search function
  searchWikipedia(userInput);

  document.getElementById("user-input").value = "";
}

function appendMessage(sender, message) {
  var chatContainer = document.getElementById("chat");
  var messageElement = document.createElement("div");
  messageElement.classList.add(sender);
  messageElement.innerHTML = message;
  chatContainer.appendChild(messageElement);

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function searchWikipedia(query) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${query}&origin=*`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Check if there are any search results
      if (data.query && data.query.search) {
        const searchResults = data.query.search;
        // Get the first search result snippet and title
        if (searchResults.length > 0) {
          const snippet = searchResults[0].snippet;
          const title = searchResults[0].title;
          const resultMessage = `${snippet}... <a href="https://en.wikipedia.org/wiki/${title}" target="_blank">Read more on Wikipedia</a>`;
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
