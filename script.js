let conversationHistory = [];
let treatment = 'Blended';

function setTreatment(type) {
  treatment = type;
  document.querySelectorAll('.treatment-buttons button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`btn-${type}`).classList.add('active');
}

function startVoiceInput() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();
  recognition.onresult = function (event) {
    document.getElementById('symptomInput').value = event.results[0][0].transcript;
  };
}

async function getResponse() {
  const input = document.getElementById('symptomInput');
  const text = input.value.trim();
  if (!text) return;

  conversationHistory.push({ role: 'user', content: `They prefer a ${treatment} approach. ${text}` });
  input.value = '';

  const resBox = document.getElementById('responseBox');
  resBox.textContent = "Dr. Sage is thinking...";

  try {
    const res = await fetch("https://drsage-backend.onrender.com/drsage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [
        { role: 'system', content: "You are Dr. Sage, a helpful AI medical assistant." },
        ...conversationHistory
      ]})
    });

    const data = await res.json();
    const reply = data.reply;
    conversationHistory.push({ role: 'assistant', content: reply });
    resBox.textContent = reply;
  } catch (err) {
    resBox.textContent = "Something went wrong contacting Dr. Sage.";
  }
}

function saveToFile() {
  const text = conversationHistory.map(entry =>
    `${entry.role === 'user' ? 'You' : 'Dr. Sage'}: ${entry.content}`).join('\n');
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "dr_sage_session.txt";
  a.click();
}
