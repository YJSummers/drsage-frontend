
let treatment = 'Blended';
let messages = [];

function setTreatment(type) {
  treatment = type;
  ['Conventional', 'Natural', 'Blended'].forEach(id => {
    document.getElementById(`btn-${id}`).classList.remove('active');
  });
  document.getElementById(`btn-${type}`).classList.add('active');
}

async function getGuidance() {
  const input = document.getElementById("symptomInput").value.trim();
  if (!input) return;

  const chatBox = document.getElementById("chatBox");
  const fullInput = `They prefer a ${treatment} approach. ${input}`;
  addMessageToUI("user", fullInput);
  messages.push({ role: "user", content: fullInput });

  try {
    const res = await fetch("https://drsage-backend.onrender.com/drsage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    const data = await res.json();
    messages.push({ role: "assistant", content: data.reply });
    addMessageToUI("assistant", data.reply);
  } catch {
    const errorMsg = "Something went wrong connecting to Dr. Sage.";
    messages.push({ role: "assistant", content: errorMsg });
    addMessageToUI("assistant", errorMsg);
  }

  document.getElementById("symptomInput").value = "";
}

function addMessageToUI(role, text) {
  const msg = document.createElement("div");
  msg.className = role;
  msg.textContent = role === "user" ? `You: ${text}` : `Dr. Sage: ${text}`;
  document.getElementById("chatBox").appendChild(msg);
  document.getElementById("chatBox").scrollTop = document.getElementById("chatBox").scrollHeight;
}

function startVoice() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();
  recognition.onresult = function(event) {
    document.getElementById('symptomInput').value = event.results[0][0].transcript;
  };
  recognition.onerror = function(event) {
    alert("Voice recognition failed: " + event.error);
  };
}

function exportChat() {
  const text = messages.map(msg =>
    msg.role === "user" ? `You: ${msg.content}` : `Dr. Sage: ${msg.content}`
  ).join("\n");
  const blob = new Blob([text], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'drsage_chat.txt';
  link.click();
}
