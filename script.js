const API_URL = "https://kohsec-team-c9-ai-7b-instruct.hf.space/v1/chat/completions";

let currentMode = "reasoning";

// Model selection
document.querySelectorAll(".model-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".model-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentMode = btn.dataset.mode;
    });
});

// DOM elements
const chatView = document.getElementById("chat-view");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

// Add message to chat
function addMessage(role, text, isStreaming = false) {
    const div = document.createElement("div");
    div.className = `message ${role}`;
    div.innerHTML = `<div class="bubble">${isStreaming ? text : marked.parse(text)}</div>`;
    chatView.appendChild(div);
    chatView.scrollTop = chatView.scrollHeight;
    return div;
}

// Send message
async function sendMessage() {
    const msg = chatInput.value.trim();
    if (!msg) return;

    chatInput.value = "";
    const userMsg = addMessage("user", msg);

    // Loading indicator
    const aiMsg = addMessage("ai", "⏳ Thinking...", true);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [{ role: "user", content: msg }],
                max_tokens: 1024,
                temperature: 0.7
            })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const reply = data.choices[0].message.content || "No response.";

        // Replace loading with real response
        aiMsg.querySelector(".bubble").innerHTML = marked.parse(reply);
    } catch (err) {
        aiMsg.querySelector(".bubble").textContent = `⚠️ Error: ${err.message}`;
    }
}

// Event listeners
sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Auto-resize textarea
chatInput.addEventListener("input", () => {
    chatInput.style.height = "auto";
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + "px";
});
