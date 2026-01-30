const API_URL = "https://animated-goldfish-jjjgvjvv4vp5hj766-8000.app.github.dev/v1/chat/completions"; // ← No trailing space

let currentMode = "reasoning";

document.querySelectorAll(".model-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".model-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentMode = btn.dataset.mode;
    });
});

const chatView = document.getElementById("chat-view");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

function addMessage(role, text) {
    const div = document.createElement("div");
    div.className = `message ${role}`;
    div.innerHTML = `<div class="bubble">${marked.parse(text)}</div>`;
    chatView.appendChild(div);
    chatView.scrollTop = chatView.scrollHeight;
}

// Retry logic for HF sleep
async function callC9API(messages) {
    for (let i = 0; i < 3; i++) {
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages,
                    max_tokens: 512,
                    temperature: 0.7
                })
            });
            if (res.ok) return await res.json();
            if (res.status === 503 && i < 2) {
                await new Promise(r => setTimeout(r, 8000)); // Wait 8 sec
                continue;
            }
            throw new Error(`HTTP ${res.status}`);
        } catch (e) {
            if (i === 2) throw e;
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

async function sendMessage() {
    const msg = chatInput.value.trim();
    if (!msg) return;

    chatInput.value = "";
    addMessage("user", msg);
    const aiId = addMessage("ai", "⏳ Thinking...");

    try {
        const data = await callC9API([{ role: "user", content: msg }]);
        const reply = data.choices[0].message.content || "No response.";
        aiId.querySelector(".bubble").innerHTML = marked.parse(reply);
    } catch (err) {
        aiId.querySelector(".bubble").textContent = `⚠️ ${err.message}`;
    }
}

sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

chatInput.addEventListener("input", () => {
    chatInput.style.height = "auto";
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + "px";
});
