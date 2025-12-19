import cv2
import os
import webbrowser
from deepface import DeepFace
from ytmusicapi import YTMusic

# 1. Setup - Suppress warnings and initialize
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
yt = YTMusic()

def play_by_mood(mood):
    mood_queries = {
        "happy": "upbeat pop hits 2024",
        "sad": "lofi hip hop chill study",
        "angry": "energetic phonk workout",
        "neutral": "mellow acoustic guitar",
        "surprise": "experimental electronic"
    }
    query = mood_queries.get(mood, "trending songs")
    print(f"🎵 Mood: {mood.upper()} | Searching: {query}")
    
    try:
        search = yt.search(query, filter="songs", limit=1)
        if search:
            video_id = search[0]['videoId']
            webbrowser.open(f"https://music.youtube.com/watch?v={video_id}")
    except Exception as e:
        print(f"YouTube Error: {e}")

# 2. Camera Initialization
cap = cv2.VideoCapture(0, cv2.CAP_AVFOUNDATION)

print("\n🚀 SYSTEM READY")
print("- Focus the window and press 'P' to play music.")
print("- Press 'Q' to quit.\n")

while True:
    ret, frame = cap.read()
    if not ret: break

    # Mirror for natural Mac view
    frame = cv2.flip(frame, 1)
    
    # Add instructions to the screen
    cv2.putText(frame, "Press 'P' to detect mood", (10, 30), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    cv2.imshow('M4 Emotion Player', frame)
    
    key = cv2.waitKey(1) & 0xFF
    if key == ord('p'):
        print("Analyzing face...")
        try:
            # Analyze frame
            results = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
            mood = results[0]['dominant_emotion']
            play_by_mood(mood)
        except Exception as e:
            print(f"Analysis Error: {e}")
            
    elif key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
for i in range(5): cv2.waitKey(1) # Mac cleanup