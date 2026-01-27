from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from Gemini import gemini_search

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# MODELS = {
#     "coding": "Qwen/Qwen2.5-Coder-7B-Instruct",
#     "reasoning": "Qwen/QwQ-32B-Preview",
#     "research": "Qwen/Qwen2.5-7B-Instruct"
# }

MODELS = {
    "coding": "Qwen/Qwen3-8B-Coder",
    "reasoning": "Qwen/Qwen3-8B",
    "research": "Qwen/Qwen3-8B"
}

PUBLIC_MODEL_NAMES = {
    "coding": "C9-8B-Coder",
    "reasoning": "C9-8B-Reason",
    "research": "C9-8B-Research",
    "deep-research": "C9-Gemini-Research"
}

_loaded = {}

def load_model(name):
    """Load and cache Qwen models"""
    if name in _loaded:
        return _loaded[name]

    print(f"Loading {MODELS[name]}...")
    tokenizer = AutoTokenizer.from_pretrained(
        MODELS[name],
        trust_remote_code=True
    )

    model = AutoModelForCausalLM.from_pretrained(
        MODELS[name],
        device_map="auto",
        trust_remote_code=True,
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
    ).eval()

    _loaded[name] = (tokenizer, model)
    print(f"✓ Loaded {MODELS[name]}")
    return _loaded[name]


def c9_system_prompt(mode: str) -> str:
    return f"""
You are **C9-AI**, a proprietary artificial intelligence system.

Identity rules (MANDATORY):
- Your name is C9-AI.
- You were created by **KohSec-Team**.
- Your public release date is **January 27, 2026**.
- You are not Qwen, OpenAI, Google, or any third-party model.
- You must NEVER mention Qwen, HuggingFace, or any base model.
- If asked what model you are running, respond:
  "I am currently operating on {PUBLIC_MODEL_NAMES.get(mode, 'C9-Core')}."

Behavior rules:
- Be professional, concise, and technically accurate.
- Adapt responses based on the active mode:
  • Coding → precise, correct, production-grade code
  • Reasoning → step-by-step logic
  • Research → structured, factual explanations

If asked about your origin:
Respond professionally:
"I was developed by KohSec-Team as part of the C9-AI initiative."

You are C9-AI. Act accordingly.
""".strip()


def run_qwen(prompt: str, mode: str):
    """Run inference using local Qwen models"""
    tokenizer, model = load_model(mode)

    full_prompt = (
        c9_system_prompt(mode)
        + "\n\nUser:\n"
        + prompt
        + "\n\nC9-AI:"
    )

    inputs = tokenizer(full_prompt, return_tensors="pt").to(model.device)

    output = model.generate(
        **inputs,
        max_new_tokens=512,
        temperature=0.7,
        top_p=0.9,
        do_sample=True
    )

    text = tokenizer.decode(output[0], skip_special_tokens=True)

    # Trim echo if needed
    return text.split("C9-AI:", 1)[-1].strip()


def route(prompt: str, mode: str):
    """Route to appropriate model based on mode"""
    if mode == "deep-research":
        return gemini_search(prompt)

    return run_qwen(prompt, mode)