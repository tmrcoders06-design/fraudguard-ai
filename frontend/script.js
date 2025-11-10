async function scan() {
  const email = document.getElementById('email').value;
  if (!email) return alert("Paste email first!");

  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('result').classList.add('hidden');

  const res = await fetch("http://localhost:8080/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('result').classList.remove('hidden');
  document.getElementById('result').className = data.isScam ? 'danger' : 'safe';
  document.getElementById('result').innerHTML = `
    <h2>${data.verdict}</h2>
    <p><strong>Confidence:</strong> ${data.confidence}%</p>
    <p><strong>Type:</strong> ${data.type}</p>
    <p><strong>Advice:</strong> ${data.advice}</p>
  `;
}