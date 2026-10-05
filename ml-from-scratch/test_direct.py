import sys
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
import os

BASE_MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"
ADAPTER_PATHS = [
    "./models/logic-intelligence-lora-v2-final",
    "./models/logic-intelligence-lora-final",
    "./logic-intelligence-lora-v2-final",
    "./logic-intelligence-lora-final",
]

device = "mps" if torch.backends.mps.is_available() else "cpu"
print(f"Loading on {device}...")
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_NAME)
base_model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL_NAME,
    torch_dtype=torch.float16 if device == "mps" else torch.float32,
    low_cpu_mem_usage=True
)

loaded_path = None
for path in ADAPTER_PATHS:
    if os.path.exists(path):
        peft_model = PeftModel.from_pretrained(base_model, path)
        model = peft_model.merge_and_unload()
        loaded_path = path
        break
if not loaded_path:
    model = base_model

model.to(device)
model.eval()

KNOWLEDGE_BASE = [
    {"keywords": ["business pro", "18999", "18,999"], "context": "Fact: Business Pro Pack is priced from ₹18,999."},
    {"keywords": ["digital launch", "8999", "8,999"], "context": "Fact: Digital Launch Pack is priced from ₹8,999."},
    {"keywords": ["enterprise", "50000", "50,000"], "context": "Fact: Enterprise Pack is custom-priced starting from ₹50,000."},
    {"keywords": ["cin"], "context": "Fact: Logic Intelligence Technologies is a technology startup based in Coimbatore, Tamil Nadu, India. Company incorporation is pending, so no CIN has been issued yet."},
    {"keywords": ["founder", "ceo"], "context": "Fact: Logic Intelligence Technologies was founded by Vikash Saravanan."}
]

def ask(q):
    q_lower = q.lower()
    rag = "\n".join([item["context"] for item in KNOWLEDGE_BASE if any(k in q_lower for k in item["keywords"])])
    sys_content = "You are the AI assistant for Logic Intelligence Technologies."
    if rag:
        sys_content += f"\n\nVerified Company Facts:\n{rag}"
    
    msgs = [
        {"role": "system", "content": sys_content},
        {"role": "user", "content": q}
    ]
    
    inputs = tokenizer.apply_chat_template(msgs, return_tensors="pt", add_generation_prompt=True).to(device)
    with torch.no_grad():
        out = model.generate(inputs, max_new_tokens=100, temperature=0.3, top_p=0.9, pad_token_id=tokenizer.eos_token_id)
    return tokenizer.decode(out[0][inputs.shape[-1]:], skip_special_tokens=True).strip()

questions = [
    "What is included in the Business Pro Pack?",
    "How much does the Digital Launch Pack cost?",
    "What is the Enterprise Pack price?",
    "What is Logic Intelligence Technologies' CIN number?",
    "Who founded Logic Intelligence Technologies?",
    "How do I optimize a React component that re-renders too often?",
    "What is the difference between useEffect and useLayoutEffect?",
    "How do I prevent SQL injection?",
    "What is your refund policy for a cancelled project after month 3?",
    "cost of business pro",
    "business pro price",
    "18999 package details"
]

for i, q in enumerate(questions):
    print(f"\nQ{i+1}: {q}")
    print(f"A: {ask(q)}")
