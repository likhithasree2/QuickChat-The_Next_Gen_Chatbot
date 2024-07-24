## QuickChat - Modern Chatbot Project

This is a simple modern chatbot project that allows users to interact with a chat interface, toggle dark mode, send messages, and upload images.

## Features
- User Interface
1. Responsive Design: Adapts the layout for optimal viewing on various devices.
2. Dark Mode: Allows users to switch between light and dark themes.
3. Custom Icons: Enhances the visual appeal and usability with Font Awesome icons.
- User Interaction
1. Text & Voice Input: Enables users to interact with the chatbot by typing or speaking.
2. File Upload & Text Extraction: Users can upload files, and the chatbot extracts and analyzes the text.
- Chatbot Capabilities
1. Enhanced NLP with Gemini API: Provides accurate and context-aware responses.
2. Summarization & Q&A: Summarizes text from files and answers related questions.
3. Joke Telling: Offers jokes to entertain users.
4. Current Time Display: Shows the current local time upon request.
- Media Handling
1. Image Generation: Retrieves and displays images using the Unsplash API.
2. Video Generation: Fetches and displays videos using the Pexels API.
3. Load More Option: Allows users to request more images or videos.
- Audio Features
1. Text-to-Speech: Converts chatbot responses into speech for auditory feedback.
2. Voice Input: Users can give commands or ask questions using their voice.
- Utility Features
1. Message Editing: Allows users to modify their messages after sending.
2. Copy Response: Enables users to copy responses from the chatbot easily.
3. Prompt Editing: Users can refine their questions or commands for better responses.
- Backend and Integration
1. Flask Server: Handles routing and API interactions securely.
2. CORS Support: Ensures secure communication between the front-end and back-end.
- Customization
1. Theme/Mode Toggle: Users can choose different themes for a personalized experience.

## Technologies Used

- HTML5
- CSS3
- JavaScript (including ES6 features)

## Getting Started

To run the chatbot locally, follow these steps:

1. Clone this repository to your local machine.
2. Open the `index.html` file in a web browser.

## Usage

1. Type your message in the input field and press Enter or click the send button to send a text message.
2. Click the microphone button to enable voice input.
3. Click the file button to upload an image.
4. Toggle dark mode by clicking the moon/sun icon button.
5. Upon uploading an image, the chatbot performs OCR to extract text from it and display it in the chat interface.
6. Edit your message by clicking the edit button next to your message.
7. Listen to bot responses by clicking the speaker icon.
8. Copy bot responses to the clipboard by clicking the copy button.

## Contributing

Contributions are welcome! Please feel free to fork this repository and submit pull requests to suggest improvements or add new features.
