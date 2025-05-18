
const treatmentButtons = document.querySelectorAll(".treatment-buttons button");
let treatment = 'Blended';
let chatHistory = [];

function setTreatment(type) {
  treatment = type;
  ['Conventional', 'Natural', 'Blended'].forEach(id => {
    document.getElementById(`btn-${id}`).classList.remove('active');
  });
  document.getElementById(`btn-${type}`).classList.add('active');
}

async function getGuidance() {
  const input = document.getElementById('symptomInput').value.trim();
  const responseBox = document.getElementById('responseBox');
  if (!input) {
    responseBox.textContent = "Please describe your symptoms.";
    return;
  }

  responseBox.textContent = "Dr. Sage is thinking...";
  chatHistory.push("You: " + input);

  const messages = [
    {
      role: "system",
      content: "You are Dr. Sage, a compassionate and highly intelligent virtual medical assistant with full diagnostic capabilities. If the user's message is vague or non-specific (e.g., 'I have an earache'), you must ask follow-up questions to gather more details before offering an assessment or treatment. Adjust responses based on their preference for conventional, natural, or blended care."
    },
    ...chatHistory.map(text => {
      return {
        role: text.startsWith("You:") ? "user" : "assistant",
        content: text.replace(/^You: |^Dr. Sage: /, "")
      };
    }),
    {
      role: "user",
      content: `They prefer a ${treatment} approach. ${input}`
    }
  ];

  try {
    const res = await fetch("https://drsage-backend.onrender.com/drsage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    const data = await res.json();
    const reply = data.reply || "No response received.";
    chatHistory.push("Dr. Sage: " + reply);
    responseBox.textContent = reply;
  } catch (err) {
    const failMsg = "Something went wrong connecting to Dr. Sage.";
    chatHistory.push("Dr. Sage: " + failMsg);
    responseBox.textContent = failMsg;
  }

  document.getElementById('symptomInput').value = '';
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
  if (!chatHistory.length) {
    alert("There's nothing to save yet!");
    return;
  }

  const text = chatHistory.join("\n");
  const blob = new Blob([text], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'drsage_chat.txt';
  link.click();
}
