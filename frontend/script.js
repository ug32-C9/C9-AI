const API = "/chat";
let currentMode = "reasoning";

document.querySelectorAll(".model-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".model-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentMode = btn.dataset.mode;
    };
});

async function sendMessage() {
    const input = document.getElementById("chat-input");
    if (!input.value.trim()) return;

    addMessage("user", input.value);
    const msg = input.value;
    input.value = "";

    // Add loading indicator
    const loadingId = addMessage("ai", "⏳ Thinking...");

    try {
        const res = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: msg, mode: currentMode })
        });

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();

        // Remove loading message
        removeMessage(loadingId);

        addMessage("ai", data.response);
    } catch (error) {
        removeMessage(loadingId);
        addMessage("ai", `⚠️ Error: ${error.message}. Please try again.`);
    }
}

function addMessage(role, text) {
    const chat = document.getElementById("chat-view");
    const div = document.createElement("div");
    div.className = `message ${role}`;
    div.id = `msg-${Date.now()}-${Math.random()}`;
    div.innerHTML = `
        <div class="bubble">
            ${marked.parse(text)}
        </div>
    `;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    return div.id;
}

function removeMessage(messageId) {
    const msg = document.getElementById(messageId);
    if (msg) msg.remove();
}


document.getElementById("send-btn").onclick = sendMessage;
