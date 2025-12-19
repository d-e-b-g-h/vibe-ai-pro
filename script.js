const video = document.getElementById('video');
const status = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const endBtn = document.getElementById('endBtn');
const historyList = document.getElementById('history-list');
const appWindow = document.getElementById('app-window');
const container = document.getElementById('video-container');
const vibeFill = document.getElementById('vibe-fill');
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const summaryOverlay = document.getElementById('summary-overlay');
const statsContent = document.getElementById('stats-content');
const downloadBtn = document.getElementById('download-btn');
const savedReportsContainer = document.getElementById('saved-reports');
const clearHistoryBtn = document.getElementById('clear-history-btn');

const musicMap = {
    happy: "https://music.youtube.com/search?q=happy+upbeat+hits",
    sad: "https://music.youtube.com/search?q=lofi+chill+sad",
    angry: "https://music.youtube.com/search?q=hard+rock+metal",
    surprised: "https://music.youtube.com/search?q=top+pop+trends",
    neutral: "https://music.youtube.com/search?q=deep+focus+ambient"
};

const themeMap = {
    happy: "#ffdd00", sad: "#0077ff", angry: "#ff4400", surprised: "#ff00ff", neutral: "#00f2ff"
};

let emotionTracker = { happy: 0, sad: 0, angry: 0, surprised: 0, neutral: 0 };
let totalDetections = 0;
let lastTriggeredEmotion = "";
let lastTriggerTime = 0;
let detectionInterval;
let isSystemRunning = false;
let canvas, displaySize;

// 1. Load Models
async function init() {
    const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
    try {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        status.innerText = "SYSTEM READY";
        loadSavedHistory();
    } catch (e) {
        status.innerText = "LOADING MODELS...";
    }
}

// 2. Start Session
startBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        video.srcObject = stream;
        
        video.onloadedmetadata = () => {
            isSystemRunning = true;
            startBtn.style.display = 'none';
            endBtn.style.display = 'block';
            status.innerText = "ACTIVE";
            
            if (canvas) canvas.remove();
            canvas = faceapi.createCanvasFromMedia(video);
            container.append(canvas);
            handleResize();
            runDetectionLoop();
        };
    } catch (err) {
        status.innerText = "CAMERA ERROR";
        alert("Camera blocked. Please enable permissions.");
    }
});

// 3. Detection Logic
function runDetectionLoop() {
    detectionInterval = setInterval(async () => {
        if (!isSystemRunning) return;

        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
        
        if (detections && detections.length > 0) {
            const resized = faceapi.resizeResults(detections, displaySize);
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resized);

            const exp = detections[0].expressions;
            const best = Object.keys(exp).reduce((a, b) => exp[a] > exp[b] ? a : b);
            
            emotionTracker[best]++;
            totalDetections++;

            status.innerText = best.toUpperCase();
            status.style.color = themeMap[best];
            vibeFill.style.width = (exp[best] * 100) + "%";
            vibeFill.style.backgroundColor = themeMap[best];
            appWindow.style.borderColor = themeMap[best];

            if (exp[best] > 0.85 && best !== lastTriggeredEmotion) {
                if (Date.now() - lastTriggerTime > 20000) {
                    lastTriggeredEmotion = best;
                    lastTriggerTime = Date.now();
                    addHistoryItem(best);
                    window.open(musicMap[best], 'musicTab');
                    sendAiMessage(`Vibe: ${best}. Updating playlist.`);
                }
            }
        }
    }, 150);
}

// 4. Session History Management
function saveSessionToHistory() {
    const sessionData = {
        id: Date.now(),
        date: new Date().toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}),
        stats: { ...emotionTracker },
        total: totalDetections
    };

    const history = JSON.parse(localStorage.getItem('vibeai_history') || '[]');
    history.unshift(sessionData);
    localStorage.setItem('vibeai_history', JSON.stringify(history.slice(0, 10)));
    loadSavedHistory();
}

function loadSavedHistory() {
    const history = JSON.parse(localStorage.getItem('vibeai_history') || '[]');
    savedReportsContainer.innerHTML = history.length ? "" : "<div style='color:#555'>No past sessions.</div>";
    
    history.forEach(session => {
        const topEmo = Object.keys(session.stats).reduce((a, b) => session.stats[a] > session.stats[b] ? a : b);
        const div = document.createElement('div');
        div.className = 'saved-item';
        div.innerHTML = `<strong>${session.date}</strong> — ${topEmo.toUpperCase()}`;
        div.onclick = () => {
            let details = "Session Stats:\n";
            Object.keys(session.stats).forEach(e => {
                const p = session.total > 0 ? Math.round((session.stats[e]/session.total)*100) : 0;
                details += `${e.toUpperCase()}: ${p}%\n`;
            });
            alert(details);
        };
        savedReportsContainer.appendChild(div);
    });
}

clearHistoryBtn.onclick = () => {
    if (confirm("Delete all past session history?")) {
        localStorage.removeItem('vibeai_history');
        loadSavedHistory();
    }
};

// 5. End Session
endBtn.addEventListener('click', () => {
    isSystemRunning = false;
    clearInterval(detectionInterval);
    
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(t => t.stop());
        video.srcObject = null;
    }
    if (canvas) canvas.remove();
    
    saveSessionToHistory();
    endBtn.style.display = 'none';
    summaryOverlay.style.display = 'flex';
    
    statsContent.innerHTML = "";
    Object.keys(emotionTracker).forEach(emo => {
        const percent = totalDetections > 0 ? Math.round((emotionTracker[emo] / totalDetections) * 100) : 0;
        statsContent.innerHTML += `
            <div style="margin-bottom:15px; width:300px; text-align:left;">
                <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:5px;">
                    <span>${emo.toUpperCase()}</span><span>${percent}%</span>
                </div>
                <div class="stat-bar-container">
                    <div class="stat-bar-fill" style="width:${percent}%; background:${themeMap[emo]}"></div>
                </div>
            </div>`;
    });
});

// 6. Extras (Chat, Download, UI)
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = userInput.value.trim();
    if (!val) return;
    chatBox.innerHTML += `<div class="user-msg">You: ${val}</div>`;
    if (val.toLowerCase().includes("play")) {
        const q = val.toLowerCase().split("play")[1].trim();
        window.open(`https://music.youtube.com/search?q=${encodeURIComponent(q || "music")}`, 'musicTab');
        sendAiMessage(`Playing: ${q || "something cool"}`);
    }
    userInput.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;
});

function sendAiMessage(t) {
    chatBox.innerHTML += `<div class="ai-msg"><strong>AI:</strong> ${t}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

downloadBtn.onclick = () => {
    let text = "VIBEAI REPORT\n==========\n";
    Object.keys(emotionTracker).forEach(e => {
        const p = totalDetections > 0 ? Math.round((emotionTracker[e]/totalDetections)*100) : 0;
        text += `${e.toUpperCase()}: ${p}%\n`;
    });
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "vibe-report.txt";
    a.click();
};

function addHistoryItem(emo) {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.style.borderLeft = `3px solid ${themeMap[emo]}`;
    li.innerHTML = `<strong>${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</strong> — ${emo.toUpperCase()}`;
    historyList.prepend(li);
}

document.getElementById('minBtn').onclick = () => appWindow.classList.toggle('minimized');
document.getElementById('maxBtn').onclick = () => {
    appWindow.classList.toggle('maximized');
    setTimeout(handleResize, 400); 
};

function handleResize() {
    if (!video.videoWidth) return;
    displaySize = { width: video.clientWidth, height: video.clientHeight };
    if (canvas) faceapi.matchDimensions(canvas, displaySize);
}

window.addEventListener('resize', handleResize);
init();