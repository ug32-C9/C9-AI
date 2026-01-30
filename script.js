const API_URL =
  "https://animated-goldfish-jjjgvjvv4vp5hj766-8000.app.github.dev/v1/chat/completions";

const chatView = document.getElementById("chat-view");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

/* -----------------------------------------
   UI Helpers
------------------------------------------ */

function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = `message ${role}`;

  div.innerHTML = `
    <div class="bubble">${marked.parse(text)}</div>
  `;

  chatView.appendChild(div);
  chatView.scrollTop = chatView.scrollHeight;
  return div; // IMPORTANT: return node
}

/* -----------------------------------------
   API Call
------------------------------------------ */

async function callAPI(messages) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messages,
      max_tokens: 512,
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }

  return res.json();
}

/* -----------------------------------------
   Send Message
------------------------------------------ */

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  chatInput.value = "";
  chatInput.style.height = "auto";

  addMessage("user", text);
  const aiMsg = addMessage("ai", "⏳ Thinking…");

  try {
    const data = await callAPI([
      { role: "user", content: text }
    ]);

    const reply =
      data?.choices?.[0]?.message?.content ??
      "No response.";

    aiMsg.querySelector(".bubble").innerHTML =
      marked.parse(reply);

  } catch (err) {
    aiMsg.querySelector(".bubble").textContent =
      "⚠️ " + err.message;
  }
}

/* -----------------------------------------
   Events
------------------------------------------ */

sendBtn.addEventListener("click", sendMessage);

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height =
    Math.min(chatInput.scrollHeight, 120) + "px";
});
