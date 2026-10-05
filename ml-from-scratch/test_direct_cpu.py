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

device = "cpu"
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_NAME)
base_model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL_NAME,
    torch_dtype=torch.float32,
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
        out = model.generate(inputs, max_new_tokens=50, temperature=0.3, top_p=0.9, pad_token_id=tokenizer.eos_token_id)
    return tokenizer.decode(out[0][inputs.shape[-1]:], skip_special_tokens=True).strip()

print(f"A1: {ask('What is included in the Business Pro Pack?')}")
