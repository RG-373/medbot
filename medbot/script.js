const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const micBtn = document.getElementById("mic-btn");
const speakToggle = document.getElementById("speak-toggle");

let lastDisease = null;
let step = 0;

// --- Medical data ---
const medicalData = [
  {
    keywords: ["fever", "cold", "cough"],
    disease: "Common Cold",
    cure: "Rest, drink warm fluids, and take paracetamol if needed.",
    precaution: "Avoid cold drinks and crowded places.",
    homeRemedy: "Steam inhalation or ginger tea with honey can help.",
  },
  {
    keywords: ["vomit", "nausea", "stomach"],
    disease: "Food Poisoning",
    cure: "Drink ORS and eat light meals like rice and banana.",
    precaution: "Avoid street food and drink boiled water.",
    homeRemedy: "Ginger tea or lemon water helps settle the stomach.",
  },
  {
    keywords: ["headache", "migraine", "stress"],
    disease: "Migraine",
    cure: "Rest in a dark room and take prescribed pain relief.",
    precaution: "Avoid bright lights and dehydration.",
    homeRemedy: "Try peppermint oil or cold compresses.",
  },
  {
    keywords: ["rash", "fever", "joint pain"],
    disease: "Dengue",
    cure: "Stay hydrated and rest well; consult a doctor.",
    precaution: "Avoid mosquito bites and don’t take aspirin.",
    homeRemedy: "Papaya leaf juice may help increase platelets.",
  },
  {
    keywords: ["throat", "pain", "sore"],
    disease: "Tonsillitis",
    cure: "Gargle with warm salt water and rest your voice.",
    precaution: "Avoid cold or spicy food.",
    homeRemedy: "Honey with warm water can soothe your throat.",
  },
];

// --- Add message ---
function addMessage(content, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);

  const avatar = document.createElement("div");
  avatar.classList.add("avatar", sender);
  avatar.textContent = sender === "bot" ? "🤖" : "🧑";

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.innerHTML = content;

  msg.appendChild(avatar);
  msg.appendChild(bubble);
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (sender === "bot" && speakToggle.checked) {
    speakText(content.replace(/<[^>]+>/g, ""));
  }
}

// --- Voice output ---
function speakText(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speech.rate = 1;
  speechSynthesis.speak(speech);
}

// --- Voice input ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => (micBtn.style.transform = "scale(1.2)");
  recognition.onend = () => (micBtn.style.transform = "scale(1)");
  recognition.onerror = (e) => console.error(e);

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    handleUserMessage();
  };
} else {
  micBtn.style.display = "none";
  console.warn("Speech recognition not supported in this browser.");
}

micBtn.addEventListener("click", () => {
  if (recognition) recognition.start();
});

// --- Chat logic ---
function getBotResponse(input) {
  const text = input.toLowerCase();

  if (step === 0) {
    for (const item of medicalData) {
      for (const word of item.keywords) {
        if (text.includes(word)) {
          lastDisease = item;
          step = 1;
          return `Hmm, sounds like you might have <b>${item.disease}</b> 🤔<br>How long have you been feeling this way?`;
        }
      }
    }
    return "Could you tell me a few specific symptoms (e.g., fever, cough, vomiting)?";
  }

  if (step === 1) {
    step = 2;
    return "Got it. Would you say your symptoms are <b>mild</b> or <b>severe</b>?";
  }

  if (step === 2) {
    step = 3;
    return `Based on what you said, it seems like <b>${lastDisease.disease}</b>.<br>
    💊 ${lastDisease.cure}<br>
    🩺 <b>Precaution:</b> ${lastDisease.precaution}<br>
    Would you like me to share some <b>home remedies</b>? 🌿`;
  }

  if (step === 3) {
    step = 0;
    if (text.includes("yes") || text.includes("sure") || text.includes("ok")) {
      return `Here are some natural remedies:<br>🌿 ${lastDisease.homeRemedy}<br><br>Would you like to talk about another symptom?`;
    } else {
      return "No problem 😊 Just make sure you rest well and stay hydrated.";
    }
  }

  return "I'm here for you! Tell me more about your symptoms.";
}

function handleUserMessage() {
  const input = userInput.value.trim();
  if (input === "") return;

  addMessage(input, "user");
  userInput.value = "";

  setTimeout(() => {
    const response = getBotResponse(input);
    addMessage(response, "bot");
  }, 700);
}

sendBtn.addEventListener("click", handleUserMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleUserMessage();
});
