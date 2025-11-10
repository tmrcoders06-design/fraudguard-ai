let model = null;

async function analyze() {
  const email = document.getElementById('emailInput').value;
  if (!email) return alert("Paste an email first!");

  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('result').classList.add('hidden');

  if (!model) {
    model = await pipeline('text-generation', 
      'https://huggingface.co/onnx-community/Llama-3.2-1B-Instruct-web/resolve/main/model_q4.onnx',
      { dtype: 'q4', device: 'webgpu' in navigator ? 'webgpu' : 'wasm' }
    );
  }

  document.getElementById('loading').classList.add('hidden');

  const prompt = `Analyze this email for scams. Return ONLY JSON:
Email: """${email}"""

{"isScam":true,"confidence":99,"type":"IRS Threat","redFlags":["Urgency","Fake domain","Bit.ly link"],"verdict":"DANGEROUS - DELETE NOW","advice":"Report to ftc.gov"}`;

  const output = await model(prompt, { max_new_tokens: 200 });
  const jsonText = output[0].generated_text.split('{"isScam":')[1];
  const result = JSON.parse('{"isScam":' + jsonText);

  document.getElementById('result').classList.remove('hidden');
  document.getElementById('result').classList.add(result.isScam ? 'danger' : 'safe');
  document.getElementById('result').innerHTML = `
    <h2>${result.verdict}</h2>
    <p><strong>Confidence:</strong> ${result.confidence}%</p>
    <p><strong>Type:</strong> ${result.type}</p>
    <div style="margin:20px 0;">
      ${result.redFlags.map(f => `<span class="flag">${f}</span>`).join('')}
    </div>
    <p><strong>Advice:</strong> ${result.advice}</p>
  `;
}