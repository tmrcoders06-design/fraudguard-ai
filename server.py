from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/scan', methods=['POST'])
def scan():
    email = request.json.get('email', '')
    # Simulate AI
    return jsonify({
        "isScam": True,
        "confidence": 99,
        "verdict": "FAKE EMAIL - DO NOT CLICK"
    })

if __name__ == '__main__':
    app.run(debug=True)