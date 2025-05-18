
const treatmentButtons = document.querySelectorAll(".treatment-buttons button");
let selectedTreatment = "Blended";

treatmentButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    treatmentButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedTreatment = btn.textContent;
  });
});

function getGuidance() {
  const input = document.getElementById("symptomInput").value.trim();
  const box = document.getElementById("responseBox");
  if (!input) {
    box.textContent = "Please describe your symptoms.";
    return;
  }

  box.textContent = "Dr. Sage is thinking...";
  fetch("https://drsage-backend.onrender.com/drsage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: "You are Dr. Sage, an intelligent and empathetic virtual health advisor.",
        },
        {
          role: "user",
          content: `They prefer a ${selectedTreatment} approach. ${input}`,
        }
      ]
    })
  })
    .then(res => res.json())
    .then(data => box.textContent = data.reply)
    .catch(() => box.textContent = "Something went wrong. Try again later.");
}

function saveToFile() {
  const content = document.getElementById("responseBox").textContent;
  if (!content) return;
  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "drsage_result.txt";
  a.click();
}

document.getElementById("voiceInput").addEventListener("click", () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.start();
  recognition.onresult = e => {
    document.getElementById("symptomInput").value = e.results[0][0].transcript;
  };
});
