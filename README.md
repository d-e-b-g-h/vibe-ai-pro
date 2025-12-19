# vibe-ai-pro
A real-time AI dashboard that tracks your mood via webcam to automate your music and workspace vibe. Built with face-api.js.

⚡ VibeAI Pro: Emotion-Driven Workspace
VibeAI Pro is a real-time, AI-powered mood tracking dashboard and interactive DJ. Using advanced computer vision, it analyzes facial expressions to synchronize your digital environment with your emotional state.

🚀 Features
Real-Time Facial Expression Analysis: Leverages face-api.js and a Tiny Face Detector to track emotions (Happy, Sad, Angry, Surprised, Neutral) at 150ms intervals.

AI Mood DJ: Automatically triggers curated YouTube Music searches based on detected high-confidence emotional peaks (e.g., detecting "Happy" energy opens an upbeat hits playlist).

Persistent Session History: Uses localStorage to save your last 10 session reports locally, allowing you to track your vibe trends over time without a database.

Dynamic UI Engine: The entire interface (borders, status text, and progress bars) adapts its color theme in real-time to match your current emotion.

Vibe Reports: Generate a post-session summary with percentage breakdowns of your emotional states and download them as .txt files.

Glassmorphism Design: A sleek, modern "Pro" workspace layout with a functional sidebar and chat interface.

🛠️ Tech Stack
Core: HTML5, CSS3 (Modern Flexbox/Grid)

Logic: Vanilla JavaScript (ES6+)

AI Engine: face-api.js (TensorFlow.js based)

Storage: Browser LocalStorage API

Deployment: GitHub Pages (requires HTTPS for Camera API)

📦 Installation & Setup
Clone the repository:

Bash
git clone https://github.com/YOUR_USERNAME/vibe-ai-pro.git
Open the project: Simply open index.html in a modern web browser.

Camera Access: Ensure you grant camera permissions when prompted. The application requires an active webcam to function.

Note: This application is optimized for desktop browsers. Mobile browsers may require "Desktop Mode" and explicit camera permissions in the browser settings.

⚖️ License
Distributed under the MIT License. See LICENSE for more information.
