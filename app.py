from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import os
import torch

app = Flask(__name__)
CORS(app)

MODEL_NAME = "onnx-community/Llama-3.2-1B-Instruct"
MODEL_PATH = "./model/llama-3.2-1b"

print("Python is loading the AI model... (180 MB)")

if not os.path.exists(MODEL_PATH):
    print("Downloading Llama-3.2-1B (one time only)...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForCausalLM.from_pretrained(MODEL_NAME, torch_dtype=torch.float16)
    tokenizer.save_pretrained(MODEL_PATH)
    model.save_pretrained(MODEL_PATH)
    print("Model downloaded & saved locally!")

# Load model
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForCausalLM.from_pretrained(MODEL_PATH, torch_dtype=torch.float16, device_map="auto")
generator = pipeline("text-generation", model=model, tokenizer=tokenizer, max_new_tokens=200)

@app.route("/")
def home():
    return "FraudGuard AI - Python Backend Running"

@app.route("/analyze", methods=["POST"])
def analyze():
    email = request.json.get("email", "")
    
    prompt = f"""You are an FBI cybersecurity agent. Analyze this email:

\"\"\"{email}\"\"\"

Return ONLY valid JSON:
{{"isScam": true, "confidence": 99, "type": "IRS Scam", "redFlags": [], "verdict": "DANGEROUS", "advice": "Delete and report"}}
"""

    try:
        result = generator(prompt)[0]["generated_text"]
        json_start = result.find('{"isScam"')
        json_str = result[json_start:]
        import json
        data = json.loads(json_str)
        return jsonify(data)
    except:
        return jsonify({"isScam": True, "verdict": "ERROR - But probably a scam ;)"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)